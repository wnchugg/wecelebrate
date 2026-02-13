#!/usr/bin/env node

/**
 * Automated Translation Merger
 * 
 * This script merges the new translation keys from translation-additions.ts
 * into the main translations.ts file for all 8 languages (Spanish, French, German,
 * Portuguese, Italian, Japanese, Chinese, Hindi).
 * 
 * Usage: node merge-translations.js
 */

const fs = require('fs');
const path = require('path');

// Read the current translations file
const translationsPath = path.join(__dirname, 'src/app/i18n/translations.ts');
const additionsPath = path.join(__dirname, 'src/app/i18n/translation-additions.ts');

console.log('🔄 Starting translation merge process...\n');

// Read the additions file
const additionsContent = fs.readFileSync(additionsPath, 'utf-8');

// Extract translations for each language from the additions file
const extractTranslations = (lang) => {
  const regex = new RegExp(`${lang}:\\s*{([\\s\\S]*?)}\\s*,?\\s*\\/\\/`, 'm');
  const match = additionsContent.match(regex);
  if (match) {
    return match[1].trim();
  }
  return null;
};

const languages = ['es', 'fr', 'de', 'pt', 'it', 'ja', 'zh', 'hi'];

// Function to insert keys after a specific marker in the language section
const insertKeysAfter = (content, lang, marker, keys) => {
  // Find the language section
  const langRegex = new RegExp(`(${lang}:\\s*{[\\s\\S]*?)(${marker})([\\s\\S]*?)(\\n\\s*\\/\\/)`, 'm');
  
  const match = content.match(langRegex);
  if (!match) {
    console.warn(`⚠️  Could not find marker "${marker}" in language "${lang}"`);
    return content;
  }
  
  const before = match[1] + match[2];
  const after = match[3] + match[4];
  
  // Insert the new keys
  const replacement = before + '\n' + keys + after;
  
  return content.replace(langRegex, replacement);
};

// Read main translations file
let translationsContent = fs.readFileSync(translationsPath, 'utf-8');

// Process each language
languages.forEach(lang => {
  console.log(`📝 Processing ${lang.toUpperCase()}...`);
  
  const additions = extractTranslations(lang);
  if (!additions) {
    console.error(`❌ Could not extract translations for ${lang}`);
    return;
  }
  
  // Split additions into sections
  const sections = {
    gifts: [],
    giftDetail: [],
    shipping: [],
    review: [],
    confirmation: []
  };
  
  // Parse the additions
  const lines = additions.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) return;
    
    if (trimmed.includes("'gifts.")) sections.gifts.push('    ' + trimmed);
    else if (trimmed.includes("'giftDetail.")) sections.giftDetail.push('    ' + trimmed);
    else if (trimmed.includes("'shipping.")) sections.shipping.push('    ' + trimmed);
    else if (trimmed.includes("'review.")) sections.review.push('    ' + trimmed);
    else if (trimmed.includes("'confirmation.")) sections.confirmation.push('    ' + trimmed);
  });
  
  // Insert each section
  if (sections.gifts.length > 0) {
    translationsContent = insertKeysAfter(
      translationsContent,
      lang,
      "'gifts\\.noResults':",
      sections.gifts.join('\n')
    );
  }
  
  if (sections.giftDetail.length > 0) {
    translationsContent = insertKeysAfter(
      translationsContent,
      lang,
      "'giftDetail\\.sku':",
      sections.giftDetail.join('\n')
    );
  }
  
  if (sections.shipping.length > 0) {
    translationsContent = insertKeysAfter(
      translationsContent,
      lang,
      "'shipping\\.subtitle':",
      sections.shipping.join('\n')
    );
  }
  
  if (sections.review.length > 0) {
    translationsContent = insertKeysAfter(
      translationsContent,
      lang,
      "'review\\.subtitle':",
      sections.review.join('\n')
    );
  }
  
  if (sections.confirmation.length > 0) {
    translationsContent = insertKeysAfter(
      translationsContent,
      lang,
      "'confirmation\\.subtitle':",
      sections.confirmation.join('\n')
    );
  }
  
  console.log(`✅ ${lang.toUpperCase()} complete\n`);
});

// Write the updated translations file
fs.writeFileSync(translationsPath, translationsContent, 'utf-8');

console.log('🎉 Translation merge complete!');
console.log(`📄 Updated file: ${translationsPath}`);
console.log('\nNext steps:');
console.log('1. Review the changes in translations.ts');
console.log('2. Test the application in all languages');
console.log('3. Commit the changes\n');
