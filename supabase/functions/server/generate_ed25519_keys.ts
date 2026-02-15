/**
 * Generate Ed25519 Key Pair for JWT Signing
 * 
 * Run this script to generate a new Ed25519 key pair for JWT authentication.
 * 
 * Usage:
 *   deno run --allow-all generate_ed25519_keys.ts
 * 
 * Output:
 *   - Public key (JWK format) - can be shared
 *   - Private key (JWK format) - keep secret!
 *   - Environment variables (base64 encoded)
 */

import { generateKeyPair, exportJWK } from 'npm:jose@5.2.0';

async function generateKeys() {
  console.log('🔑 Generating Ed25519 key pair for JWT authentication...\n');
  
  // Generate Ed25519 key pair
  const { publicKey, privateKey } = await generateKeyPair('EdDSA', {
    crv: 'Ed25519',
  });
  
  // Export as JWK (JSON Web Key)
  const publicJWK = await exportJWK(publicKey);
  const privateJWK = await exportJWK(privateKey);
  
  console.log('✅ Key pair generated successfully!\n');
  console.log('='.repeat(80));
  console.log('PUBLIC KEY (JWK format - can be shared)');
  console.log('='.repeat(80));
  console.log(JSON.stringify(publicJWK, null, 2));
  
  console.log('\n' + '='.repeat(80));
  console.log('PRIVATE KEY (JWK format - KEEP SECRET!)');
  console.log('='.repeat(80));
  console.log(JSON.stringify(privateJWK, null, 2));
  
  // Export as base64 for environment variables
  const publicKeyB64 = btoa(JSON.stringify(publicJWK));
  const privateKeyB64 = btoa(JSON.stringify(privateJWK));
  
  console.log('\n' + '='.repeat(80));
  console.log('ENVIRONMENT VARIABLES (for Supabase Edge Functions)');
  console.log('='.repeat(80));
  console.log('\nAdd these to your Supabase project:');
  console.log('Project Settings → Edge Functions → Secrets\n');
  console.log(`JWT_PUBLIC_KEY=${publicKeyB64}`);
  console.log(`JWT_PRIVATE_KEY=${privateKeyB64}`);
  
  console.log('\n' + '='.repeat(80));
  console.log('LOCAL DEVELOPMENT (.env.local)');
  console.log('='.repeat(80));
  console.log('\nAdd these to your .env.local file:\n');
  console.log(`JWT_PUBLIC_KEY=${publicKeyB64}`);
  console.log(`JWT_PRIVATE_KEY=${privateKeyB64}`);
  
  console.log('\n' + '='.repeat(80));
  console.log('SECURITY NOTES');
  console.log('='.repeat(80));
  console.log('✅ Public key can be shared freely (used for verification)');
  console.log('🔒 Private key must be kept secret (used for signing)');
  console.log('⚠️  Never commit private key to version control');
  console.log('⚠️  Never log private key in production');
  console.log('⚠️  Rotate keys if private key is compromised');
  
  console.log('\n' + '='.repeat(80));
  console.log('NEXT STEPS');
  console.log('='.repeat(80));
  console.log('1. Copy the environment variables above');
  console.log('2. Add them to Supabase Edge Functions secrets');
  console.log('3. Update index.tsx to use Ed25519 (see JWT_SECURITY_EVALUATION.md)');
  console.log('4. Deploy and test');
  console.log('5. Verify tokens are working correctly');
  
  console.log('\n✅ Done! Keys generated successfully.\n');
}

// Run the generator
if (import.meta.main) {
  generateKeys().catch(error => {
    console.error('❌ Error generating keys:', error);
    Deno.exit(1);
  });
}

export { generateKeys };
