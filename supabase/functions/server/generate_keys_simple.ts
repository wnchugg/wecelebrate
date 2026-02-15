/**
 * Simple Ed25519 Key Generator (No External Dependencies)
 * Uses Deno's built-in Web Crypto API
 */

async function generateEd25519Keys() {
  console.log('🔑 Generating Ed25519 key pair...\n');
  
  // Generate Ed25519 key pair using Web Crypto API
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'Ed25519',
    },
    true, // extractable
    ['sign', 'verify']
  );
  
  // Export keys as JWK
  const publicJWK = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateJWK = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
  
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
  const encoder = new TextEncoder();
  const publicKeyB64 = btoa(JSON.stringify(publicJWK));
  const privateKeyB64 = btoa(JSON.stringify(privateJWK));
  
  console.log('\n' + '='.repeat(80));
  console.log('ENVIRONMENT VARIABLES (Copy these to Supabase)');
  console.log('='.repeat(80));
  console.log('\nGo to: Supabase Dashboard → Project Settings → Edge Functions → Secrets\n');
  console.log(`JWT_PUBLIC_KEY=${publicKeyB64}`);
  console.log(`\nJWT_PRIVATE_KEY=${privateKeyB64}`);
  
  console.log('\n' + '='.repeat(80));
  console.log('NEXT STEPS');
  console.log('='.repeat(80));
  console.log('1. Copy JWT_PUBLIC_KEY and JWT_PRIVATE_KEY above');
  console.log('2. Add them to Supabase Edge Functions secrets');
  console.log('3. The code in index.tsx is ready to use these keys');
  console.log('4. Deploy and test');
  
  console.log('\n✅ Done!\n');
}

// Run
generateEd25519Keys().catch(console.error);
