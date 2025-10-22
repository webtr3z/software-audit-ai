#!/usr/bin/env node

/**
 * Script to validate Anthropic API Key format
 */

const fs = require("fs");
const path = require("path");

// Read .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
let apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
  if (match) {
    apiKey = match[1].trim();
  }
}

console.log("\n🔍 Verificando API Key de Anthropic...\n");

if (!apiKey) {
  console.error("❌ ERROR: ANTHROPIC_API_KEY no está definida en .env.local");
  console.log("\n📋 Para obtener tu API key:");
  console.log("   1. Ve a: https://console.anthropic.com/account/keys");
  console.log("   2. Genera una nueva API key");
  console.log("   3. Agrégala a tu archivo .env.local\n");
  process.exit(1);
}

console.log("✅ API Key encontrada");
console.log(`   Longitud: ${apiKey.length} caracteres`);
console.log(`   Prefijo: ${apiKey.substring(0, 15)}...`);

if (!apiKey.startsWith("sk-ant-")) {
  console.error("\n❌ ERROR: Formato de API key inválido!");
  console.log("   Las claves de Anthropic deben comenzar con 'sk-ant-'");
  console.log(`   Tu clave comienza con: '${apiKey.substring(0, 7)}...'`);
  console.log("\n📋 Por favor verifica que:");
  console.log("   1. Copiaste la clave completa");
  console.log("   2. No hay espacios o saltos de línea");
  console.log("   3. La clave no está vencida o revocada");
  console.log(
    "\n   Genera una nueva en: https://console.anthropic.com/account/keys\n"
  );
  process.exit(1);
}

if (apiKey.length < 50) {
  console.warn("\n⚠️  ADVERTENCIA: La clave parece muy corta");
  console.log(
    "   Las claves de Anthropic suelen tener más de 100 caracteres\n"
  );
}

console.log("\n✅ ¡Formato de API key válido!");
console.log("\n🧪 Probando conexión con Anthropic API...\n");

// Test the API connection
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({ apiKey });

anthropic.beta.messages
  .create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 50,
    temperature: 1,
    betas: ["web-search-2025-03-05"],
    messages: [{ role: "user", content: "Hi" }],
  })
  .then((response) => {
    console.log("✅ ¡Conexión exitosa con Anthropic API!");
    console.log(`   Modelo: claude-sonnet-4-5-20250929`);
    console.log(`   Respuesta: "${response.content[0].text}"`);
    console.log("\n🎉 Todo está configurado correctamente!\n");
  })
  .catch((error) => {
    console.error("\n❌ ERROR al conectar con Anthropic API:");
    console.error(`   Código: ${error.status || "N/A"}`);
    console.error(`   Mensaje: ${error.message}`);

    if (error.status === 401) {
      console.log("\n📋 Error de autenticación. Posibles causas:");
      console.log("   1. La API key es incorrecta o está vencida");
      console.log("   2. La clave fue revocada");
      console.log("   3. No tienes acceso al modelo solicitado");
      console.log(
        "\n   Genera una nueva clave en: https://console.anthropic.com/account/keys\n"
      );
    } else if (error.status === 404) {
      console.log("\n📋 Modelo no encontrado. Posibles causas:");
      console.log("   1. Tu cuenta no tiene acceso a Claude Sonnet 4.5");
      console.log("   2. El modelo aún no está disponible en tu región");
      console.log(
        "\n   Contacta a soporte de Anthropic si el problema persiste\n"
      );
    }

    process.exit(1);
  });
