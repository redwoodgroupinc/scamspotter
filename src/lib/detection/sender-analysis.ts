/**
 * Sender address checks for the Email Checker.
 *
 * These checks read ONLY the text of the address the user typed. They do not
 * inspect email headers, SPF/DKIM/DMARC results, domain ownership or sender
 * reputation, and an address that "passes" can still be forged.
 */

import { FREE_EMAIL_DOMAINS, HIGH_ABUSE_TLDS } from "./domains";
import { MAX_SENDER_LENGTH } from "./limits";
import type { SenderAnalysis, SenderObservation } from "./types";
import { findBrandReferences, findLookalike, getRegistrableDomain, isOfficialFor, letterTokens } from "./url-analysis";

const ADDRESS_PATTERN = /^[^\s@<>()",;:]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;
const EMBEDDED_ADDRESS = /[^\s@<>()",;:]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+/i;
const GOVERNMENT_DOMAIN = /(?:^|\.)(?:gov|gov\.uk|gc\.ca|canada\.ca|gov\.au)$/i;

export interface ParsedSender {
  displayName: string | null;
  address: string | null;
}

/** Accepts "Name <user@example.com>", "<user@example.com>" or "user@example.com". */
export function parseSender(raw: string): ParsedSender {
  const value = raw
    .replace(/[​-‏⁠﻿]/g, "")
    .trim()
    .slice(0, MAX_SENDER_LENGTH);
  const angle = value.match(/^(.*?)<\s*([^<>\s]+)\s*>\s*$/);
  if (angle) {
    const displayName = angle[1]!
      .trim()
      .replace(/^["']|["']$/g, "")
      .trim();
    return { displayName: displayName || null, address: angle[2]!.trim() };
  }
  return { displayName: null, address: value || null };
}

export function analyzeSender(raw: string, options: { bodyMentionsOrganisation?: boolean } = {}): SenderAnalysis {
  const input = raw.trim().slice(0, MAX_SENDER_LENGTH);
  const { displayName, address } = parseSender(input);
  const observations: SenderObservation[] = [];

  if (!address || !ADDRESS_PATTERN.test(address)) {
    return {
      input,
      displayName,
      address,
      domain: null,
      valid: false,
      observations: [
        {
          id: "sender-invalid",
          label: "Couldn't read the sender address",
          status: "info",
          detail:
            "Enter the full address, for example name@example.com. You can also paste it as Name <name@example.com>.",
        },
      ],
    };
  }

  const [localPart = "", rawDomain = ""] = address.toLowerCase().split(/@(?=[^@]+$)/);
  const domain = rawDomain.replace(/\.$/, "");
  const registrable = getRegistrableDomain(domain);
  const isFreeMail = FREE_EMAIL_DOMAINS.has(domain) || FREE_EMAIL_DOMAINS.has(registrable);

  // Display name that contains a different email address ("support@paypal.com" <x@other.example>)
  const displayAddress = displayName?.match(EMBEDDED_ADDRESS)?.[0]?.toLowerCase();
  if (displayAddress && displayAddress !== address.toLowerCase()) {
    observations.push({
      id: "sender-display-address",
      label: "Display name shows a different address",
      status: "fail",
      detail: `The name shown is "${displayName}", but the message actually came from ${address}. Email apps often show only the name, which makes this trick easy to miss.`,
    });
  }

  // Brand or organisation named in the display name / mailbox name
  const nameText = `${displayName ?? ""} ${localPart}`;
  const nameBrands = findBrandReferences(nameText).filter((reference) => !isOfficialFor(reference.brand, domain));
  const claimsOrganisation = nameBrands.length > 0 || Boolean(options.bodyMentionsOrganisation);

  const lookalike = findLookalike(domain);
  if (lookalike) {
    observations.push({
      id: "sender-lookalike",
      label: `Domain imitates ${lookalike.brand.name}`,
      status: "fail",
      detail: `"${domain}" resembles ${lookalike.brand.name}'s name but isn't one of its domains. Misspelled sender domains are a common phishing technique.`,
    });
  }

  if (isFreeMail) {
    observations.push(
      claimsOrganisation
        ? {
            id: "sender-free-provider-org",
            label: "Organisation message from a personal email account",
            status: "fail",
            detail: `${domain} is a free, personal email service. Banks, government agencies and large companies send official messages from their own domains, not from personal mailboxes.`,
          }
        : {
            id: "sender-free-provider",
            label: "Personal email account",
            status: "info",
            detail: `${domain} is a free email service. That's normal for individuals, but be cautious if the sender claims to represent a company, recruiter or government agency.`,
          },
    );
  } else if (!lookalike) {
    const domainBrands = findBrandReferences(domain.replace(/\.[^.]+$/, "")).filter(
      (reference) => !isOfficialFor(reference.brand, domain),
    );
    const mismatch = nameBrands[0] ?? domainBrands[0];
    if (mismatch) {
      const isGov = mismatch.brand.kind === "government";
      observations.push({
        id: "sender-brand-mismatch",
        label: isGov
          ? "Government-sounding sender on a non-government domain"
          : `Mentions ${mismatch.brand.name} but uses another domain`,
        status: "fail",
        detail: isGov
          ? `The sender refers to ${mismatch.brand.name}, but ${domain} is not a government domain.`
          : `The sender mentions "${mismatch.keyword}", but the address belongs to ${registrable}, which isn't on our short list of ${mismatch.brand.name} domains. Check the company's real domain yourself.`,
      });
    } else if (letterTokens(domain).includes("gov") && !GOVERNMENT_DOMAIN.test(domain)) {
      observations.push({
        id: "sender-brand-mismatch",
        label: "Government-sounding sender on a non-government domain",
        status: "fail",
        detail: `${domain} contains "gov" but is not a government domain.`,
      });
    }
  }

  const tld = domain.split(".").pop() ?? "";
  if (HIGH_ABUSE_TLDS.has(tld)) {
    observations.push({
      id: "sender-tld",
      label: `Domain ending ".${tld}"`,
      status: "warn",
      detail: `.${tld} domains are cheap and common in abuse reports, though many legitimate senders use them. Weak signal only.`,
    });
  }

  const mainLabel = registrable.split(".")[0] ?? "";
  if ((mainLabel.match(/-/g) ?? []).length >= 2 || /\d{4,}/.test(mainLabel)) {
    observations.push({
      id: "sender-domain-pattern",
      label: "Unusual domain name",
      status: "warn",
      detail: `"${registrable}" strings together hyphens or numbers in a way that's uncommon for established organisations.`,
    });
  }

  if (/\d{5,}/.test(localPart) || /[bcdfghjklmnpqrstvwxz]{6,}/.test(localPart)) {
    observations.push({
      id: "sender-random-mailbox",
      label: "Random-looking mailbox name",
      status: "warn",
      detail: `"${localPart}" looks machine-generated. Bulk scam campaigns often use throwaway mailboxes.`,
    });
  }

  if (observations.length === 0) {
    observations.push({
      id: "sender-no-pattern",
      label: "No unusual patterns in the address text",
      status: "pass",
      detail:
        "Nothing stood out in how this address is written. Sender addresses can be forged or come from hacked accounts, and we can't check email headers, so this doesn't confirm who sent the message.",
    });
  }

  return { input, displayName, address, domain, valid: true, observations };
}
