import { describe, expect, it } from "vitest";

import {
  SECRET_PATTERN_CATEGORIES,
  SECRET_PATTERNS,
  type SecretPattern,
} from "./secret-patterns";

function testMatch(pattern: SecretPattern, sample: string): string | undefined {
  const regex = new RegExp(pattern.pattern, "i");
  const match = regex.exec(sample);
  return match?.[1] ?? match?.[0];
}

const POSITIVE_SAMPLES: [string, string, string][] = [
  // Cloud Providers
  [
    "Alibaba Cloud Access Key ID",
    "key=LTAI5tAbCdEfGhIjKlMnOpQrS",
    "LTAI5tAbCdEfGhIjKlMnOpQrS",
  ],
  [
    "DigitalOcean Token",
    "token=dop_v1_" + "a".repeat(64),
    "dop_v1_" + "a".repeat(64),
  ],
  ["PlanetScale DB Host", "host=aws.connect.psdb.cloud", "aws"],
  [
    "PlanetScale DB Password",
    "pw=pscale_pw_" + "A".repeat(43),
    "pscale_pw_" + "A".repeat(43),
  ],
  [
    "PlanetScale Password",
    "token=pscale_tkn_" + "B".repeat(43),
    "pscale_tkn_" + "B".repeat(43),
  ],
  [
    "Azure Container Registry URL",
    "registry=myregistry01.azurecr.io",
    "myregistry01",
  ],

  // AI & ML
  [
    "Anthropic API Key",
    "key=sk-ant-api03-" + "a".repeat(93) + "AA",
    "sk-ant-api03-" + "a".repeat(93) + "AA",
  ],
  ["Groq API Key", "key=gsk_" + "a".repeat(52), "gsk_" + "a".repeat(52)],
  [
    "Hugging Face Token",
    "Authorization: Bearer hf_" + "a".repeat(34),
    "hf_" + "a".repeat(34),
  ],
  [
    "LangSmith API Key",
    "key=lsv2_pt_" + "a".repeat(32) + "_" + "b".repeat(10),
    "lsv2_pt_" + "a".repeat(32) + "_" + "b".repeat(10),
  ],
  ["NVIDIA API Key", "key=nvapi-" + "a".repeat(64), "nvapi-" + "a".repeat(64)],
  ["Replicate API Key", "token=r8_" + "a".repeat(37), "r8_" + "a".repeat(37)],
  ["xAI API Key", "key=xai-" + "a".repeat(80), "xai-" + "a".repeat(80)],

  // CI/CD & DevOps
  ["NPM Token", "token=npm_" + "a".repeat(36), "npm_" + "a".repeat(36)],
  ["Prefect API Key", "key=pnu_" + "a".repeat(36), "pnu_" + "a".repeat(36)],
  [
    "Pulumi Access Token",
    "token=pul-" + "a".repeat(40),
    "pul-" + "a".repeat(40),
  ],
  [
    "TruffleHog Enterprise Key",
    "key=thog-key-" + "a".repeat(16),
    "thog-key-" + "a".repeat(16),
  ],
  [
    "TruffleHog Enterprise Secret",
    "secret=thog-secret-" + "a".repeat(32),
    "thog-secret-" + "a".repeat(32),
  ],

  // Payment & Finance
  [
    "Flutterwave Key",
    "key=FLWSECK-" + "a".repeat(32) + "-X",
    "FLWSECK-" + "a".repeat(32) + "-X",
  ],
  [
    "Pagar.me Key",
    "key=ak_live_" + "a".repeat(30),
    "ak_live_" + "a".repeat(30),
  ],
  [
    "Stripe Publishable Key",
    "key=pk_live_" + "a".repeat(24),
    "pk_live_" + "a".repeat(24),
  ],
  [
    "Stripe Secret Key",
    "key=sk_live_" + "a".repeat(24),
    "sk_live_" + "a".repeat(24),
  ],
  [
    "Stripe Client Secret",
    "secret=pi_" + "a".repeat(24) + "_secret_" + "b".repeat(25),
    "pi_" + "a".repeat(24) + "_secret_" + "b".repeat(25),
  ],
  ["Square Key", "key=sq0idp-" + "a".repeat(22), "sq0idp-" + "a".repeat(22)],

  // Communication
  [
    "Brevo (Sendinblue) Key",
    "key=xkeysib-" + "a".repeat(81),
    "xkeysib-" + "a".repeat(81),
  ],
  [
    "Discord Webhook URL",
    "url=https://discord.com/api/webhooks/123456789012345678/" + "a".repeat(68),
    "https://discord.com/api/webhooks/123456789012345678/" + "a".repeat(68),
  ],
  ["Postman API Key", "key=PMAK-" + "a".repeat(59), "PMAK-" + "a".repeat(59)],
  [
    "SendGrid API Key",
    "SG." + "a".repeat(22) + "." + "b".repeat(43),
    "SG." + "a".repeat(22) + "." + "b".repeat(43),
  ],
  ["Twilio Account SID", "sid=AC" + "a".repeat(32), "AC" + "a".repeat(32)],
  ["Twilio API Key", "key=SK" + "a".repeat(32), "SK" + "a".repeat(32)],

  // Database & Storage
  [
    "Couchbase Connection String",
    "couchbase=cb.abc123.cloud.couchbase.com",
    "cb.abc123.cloud.couchbase.com",
  ],
  ["Supabase Token", "token=sbp_" + "a".repeat(40), "sbp_" + "a".repeat(40)],

  // SaaS & APIs
  [
    "Apify Token",
    "token=apify_api_" + "a".repeat(36),
    "apify_api_" + "a".repeat(36),
  ],
  [
    "Contentful Access Token",
    "token=CFPAT-" + "a".repeat(43),
    "CFPAT-" + "a".repeat(43),
  ],
  [
    "Linear API Key",
    "key=lin_api_" + "a".repeat(40),
    "lin_api_" + "a".repeat(40),
  ],
  [
    "Notion API Key",
    "key=secret_" + "a".repeat(43),
    "secret_" + "a".repeat(43),
  ],
  ["PostHog API Key", "key=phx_" + "a".repeat(43), "phx_" + "a".repeat(43)],
  [
    "Rootly API Key",
    "key=rootly_" + "a".repeat(64),
    "rootly_" + "a".repeat(64),
  ],
  [
    "Shopify Domain",
    "shop=mystore-test.myshopify.com",
    "mystore-test.myshopify.com",
  ],
  ["Ubidots API Key", "key=BBFF-" + "a".repeat(30), "BBFF-" + "a".repeat(30)],
  [
    "Fleetbase Key",
    "key=flb_live_" + "a".repeat(20),
    "flb_live_" + "a".repeat(20),
  ],
  [
    "Frame.io Token",
    "token=fio-u-" + "a".repeat(64),
    "fio-u-" + "a".repeat(64),
  ],
  [
    "Grafana Service Account Key",
    "key=glsa_" + "a".repeat(41),
    "glsa_" + "a".repeat(41),
  ],

  // Security & Auth
  [
    "Tailscale API Key",
    "key=tskey-api-" + "a".repeat(12) + "-" + "b".repeat(12),
    "tskey-api-" + "a".repeat(12) + "-" + "b".repeat(12),
  ],

  // Tokens & Keys
  ["Access Key ID", "key=AKIAIOSFODNN7EXAMPLE", "AKIAIOSFODNN7EXAMPLE"],
  ["Session Key ID", "key=ASIAQWERTYUIOP1234AB", "ASIAQWERTYUIOP1234AB"],

  // Webhooks
  [
    "Zapier Webhook URL",
    "https://hooks.zapier.com/hooks/catch/1234567890abcdef",
    "https://hooks.zapier.com/hooks/catch/1234567890abcdef",
  ],

  // Infrastructure
  [
    "FTP Credentials",
    "ftp://admin:p4ssw0rd@files.example.com/upload",
    "p4ssw0rd",
  ],
  [
    "PubNub Publish Key",
    "key=pub-c-12345678-abcd-1234-abcd-123456789012",
    "pub-c-12345678-abcd-1234-abcd-123456789012",
  ],

  // Other
  ["Adafruit IO Key", "key=aio_" + "a".repeat(28), "aio_" + "a".repeat(28)],
  [
    "Buildkite Agent Token",
    "token=bkua_" + "a".repeat(40),
    "bkua_" + "a".repeat(40),
  ],
  ["Databricks Token", "token=dapi" + "a".repeat(32), "dapi" + "a".repeat(32)],
  ["Deno Deploy Token", "token=ddp_" + "a".repeat(36), "ddp_" + "a".repeat(36)],
  ["GitHub Token", "token=ghp_" + "a".repeat(36), "ghp_" + "a".repeat(36)],
  [
    "GitLab Personal Access Token",
    "token=glpat-" + "a".repeat(20),
    "glpat-" + "a".repeat(20),
  ],
  [
    "Heroku API Key",
    "key=HRKU-AA" + "a".repeat(58),
    "HRKU-AA" + "a".repeat(58),
  ],
  ["Nightfall Key", "key=NF-" + "a".repeat(32), "NF-" + "a".repeat(32)],
  [
    "Sentry User Auth Token",
    "token=sntryu_" + "a".repeat(64),
    "sntryu_" + "a".repeat(64),
  ],
  [
    "Bitbucket App Password",
    "pw=bb_pr_" + "a".repeat(30),
    "bb_pr_" + "a".repeat(30),
  ],
  [
    "Docker Access Token",
    "token=dckr_pat_" + "a".repeat(27) + " rest",
    "dckr_pat_" + "a".repeat(27),
  ],

  // --- Cloud Providers (missing) ---
  [
    "Azure API Management URL",
    "https://myapiservice01.azure-api.net/v1",
    "myapiservice01",
  ],
  [
    "Azure App Config Connection String",
    "Endpoint=https://myconfig-app.azconfig.io;Id=abc123+/==;Secret=def456+/==",
    "https://myconfig-app.azconfig.io",
  ],
  [
    "Azure Batch URL",
    "https://mybatchaccount.eastus.batch.azure.com",
    "mybatchaccount",
  ],
  [
    "Azure Container Registry Password",
    "pw=" + "a".repeat(42) + "+ACR" + "b".repeat(6),
    "a".repeat(42) + "+ACR" + "b".repeat(6),
  ],
  [
    "Azure Direct Management URL",
    "https://myservice01.management.azure-api.net/sub",
    "myservice01",
  ],
  [
    "Azure Entra Tenant",
    "tenant=contoso-corp.onmicrosoft.com",
    "contoso-corp.onmicrosoft.com",
  ],
  [
    "Azure Function URL",
    "https://myfunctionapp01.azurewebsites.net/api/my-function-name",
    "myfunctionapp01",
  ],
  [
    "Azure SAS Token URL",
    "https://mystorage01.blob.core.windows.net/mycontainer/myblob.txt",
    "mystorage01",
  ],
  [
    "GCP Application Default Credentials",
    '{"client_secret":"mysecret123","client_id":"id"}',
    '{"client_secret":"mysecret123","client_id":"id"}',
  ],
  [
    "GCP Service Account Key",
    '{"auth_provider_x509_cert_url":"https://example.com"}',
    '{"auth_provider_x509_cert_url":"https://example.com"}',
  ],

  // --- AI & ML (missing) ---
  [
    "Gemini Key",
    "key=master-aBcDeFgHiJkLmNoPqRsT",
    "master-aBcDeFgHiJkLmNoPqRsT",
  ],
  [
    "Sourcegraph Cody Token",
    "key=slk_" + "a".repeat(64),
    "slk_" + "a".repeat(64),
  ],

  // --- CI/CD & DevOps (missing) ---
  ["Doppler Token", "key=dp.ct." + "a".repeat(40), "dp.ct." + "a".repeat(40)],
  ["JFrog Artifactory Key", "key=" + "a".repeat(64), "a".repeat(64)],
  ["JFrog Artifactory URL", "url=mycompany01.jfrog.io", "mycompany01.jfrog.io"],
  [
    "LaunchDarkly Key",
    "key=sdk-abcd1234-ef56-4789-gh01-ijklmnop2345",
    "sdk-abcd1234-ef56-4789-gh01-ijklmnop2345",
  ],
  ["Repository Deploy Key", "version=1.2.3", "1.2.3"],
  [
    "RubyGems API Key",
    "key=rubygems_" + "a".repeat(48),
    "rubygems_" + "a".repeat(48),
  ],
  [
    "Sourcegraph Token",
    "key=sgp_" + "a".repeat(16) + "_" + "b".repeat(40),
    "sgp_" + "a".repeat(16) + "_" + "b".repeat(40),
  ],
  [
    "Terraform Cloud Token",
    "key=" + "A".repeat(14) + ".atlasv1." + "B".repeat(67),
    "A".repeat(14) + ".atlasv1." + "B".repeat(67),
  ],
  [
    "TruffleHog Enterprise Hostname",
    "host=alpha-beta-gamma.a1.x.trufflehog.org",
    "alpha-beta-gamma.a1.x.trufflehog.org",
  ],

  // --- Payment & Finance (missing) ---
  [
    "Coinbase Key Name",
    "organizations/abcdef12-1234-5678-abcd-123456789abc/apiKeys/12345678-1234-5678-1234-123456789abc",
    "organizations/abcdef12-1234-5678-abcd-123456789abc/apiKeys/12345678-1234-5678-1234-123456789abc",
  ],
  [
    "Coinbase Private Key",
    "-----BEGIN EC PRIVATE KEY-----\nMHQCAQEEIBkg2yb=\n-----END EC PRIVATE KEY-----\n",
    "-----BEGIN EC PRIVATE KEY-----\nMHQCAQEEIBkg2yb=\n-----END EC PRIVATE KEY-----\n",
  ],
  [
    "GoCardless Key",
    "key=live_" + "A".repeat(40) + " ",
    "live_" + "A".repeat(40) + " ",
  ],
  [
    "PayPal OAuth Client ID",
    "id=" + "A".repeat(7) + "-" + "B".repeat(72),
    "A".repeat(7) + "-" + "B".repeat(72),
  ],
  ["PayPal OAuth Secret", "secret=" + "A".repeat(44), "A".repeat(44)],
  [
    "Paystack Key",
    "key=sk_live_" + "A".repeat(40),
    "sk_live_" + "A".repeat(40),
  ],
  [
    "Robinhood Crypto Key",
    "key=rh-api-abcdef12-1234-5678-abcd-123456789abc",
    "rh-api-abcdef12-1234-5678-abcd-123456789abc",
  ],
  [
    "Robinhood Crypto Private Key",
    " TXlQcml2YXRlS2V5QmFzZTY0RW5jb2RlZA== ",
    "TXlQcml2YXRlS2V5QmFzZTY0RW5jb2RlZA==",
  ],
  [
    "Square App Key",
    "key=sq0iab-AbCdEfGhIjKlMnOpQrStUv",
    "sq0iab-AbCdEfGhIjKlMnOpQrStUv",
  ],
  [
    "Square App Secret",
    "key=sq0csp-" + "A".repeat(40),
    "sq0csp-" + "A".repeat(40),
  ],
  ["WePay App ID", "id=123456", "123456"],

  // --- Communication (missing) ---
  [
    "Mailchimp API Key",
    "key=" + "a".repeat(32) + "-us12",
    "a".repeat(32) + "-us12",
  ],
  [
    "Microsoft Teams Webhook",
    "https://outlook.webhook.office.com/webhookb2/abcdef12-1234-5678-abcd-123456789012@abcdef12-1234-5678-abcd-123456789012/IncomingWebhook/" +
      "a".repeat(32) +
      "/abcdef12-1234-5678-abcd-123456789012",
    "https://outlook.webhook.office.com/webhookb2/abcdef12-1234-5678-abcd-123456789012@abcdef12-1234-5678-abcd-123456789012/IncomingWebhook/" +
      "a".repeat(32) +
      "/abcdef12-1234-5678-abcd-123456789012",
  ],
  ["SignalWire URL", "url=my-space.signalwire.com", "my-space.signalwire.com"],
  [
    "Voiceflow API Key",
    "key=VF.DM." + "a".repeat(24) + "." + "B".repeat(16),
    "VF.DM." + "a".repeat(24) + "." + "B".repeat(16),
  ],
  [
    "Webex Bot Token",
    "token=" +
      "a".repeat(64) +
      "_" +
      "b".repeat(4) +
      "_" +
      "c".repeat(8) +
      "-" +
      "d".repeat(4) +
      "-" +
      "e".repeat(4) +
      "-" +
      "f".repeat(4) +
      "-" +
      "1".repeat(12),
    "a".repeat(64) +
      "_" +
      "b".repeat(4) +
      "_" +
      "c".repeat(8) +
      "-" +
      "d".repeat(4) +
      "-" +
      "e".repeat(4) +
      "-" +
      "f".repeat(4) +
      "-" +
      "1".repeat(12),
  ],

  // --- Database & Storage (missing) ---
  [
    "Azure Redis Connection",
    "myredis.redis.cache.windows.net:6380,password=" +
      "A".repeat(43) +
      "=,ssl=True,abortConnect=False",
    "myredis.redis.cache.windows.net:6380",
  ],
  ["MongoDB Placeholder Password", "xxxxxxx", "xxxxxxx"],
  [
    "RabbitMQ Credentials",
    "amqp://guest:mypassword@rabbitmq.example.com/vhost",
    "mypassword",
  ],
  [
    "Redis Password",
    "redis://default:s3cret_pass@redis.example.com:6379/0",
    "s3cret_pass",
  ],

  // --- SaaS & APIs (missing) ---
  [
    "42 Intra Client ID",
    "id=u-s4t2ud-" + "a".repeat(64),
    "u-s4t2ud-" + "a".repeat(64),
  ],
  [
    "42 Intra Client Secret",
    "secret=s-s4t2af-" + "b".repeat(64),
    "s-s4t2af-" + "b".repeat(64),
  ],
  ["Aha! URL", "url=mycompany.aha.io", "mycompany.aha.io"],
  [
    "Apideck API Key",
    "key=sk_live_" + "a".repeat(93),
    "sk_live_" + "a".repeat(93),
  ],
  [
    "Auth0 Management API Token",
    "token=eyJhbGciOiJSUzI1NiJ9.payload.sig",
    "eyJhbGciOiJSUzI1NiJ9.payload.sig",
  ],
  [
    "Auth0 Management Domain",
    "domain=mycompany.us.auth0.com",
    "mycompany.us.auth0.com",
  ],
  [
    "Auth0 OAuth Domain",
    "domain=mycompany-dev.auth0.com",
    "mycompany-dev.auth0.com",
  ],
  [
    "Caflou API Key",
    "key=eyJhbGciOiJIUzI1NiJ9" + "a".repeat(135),
    "eyJhbGciOiJIUzI1NiJ9" + "a".repeat(135),
  ],
  ["ClickHelp Portal", "url=myportal.clickhelp.co", "myportal.clickhelp.co"],
  ["Close CRM Key", "key=api_" + "a".repeat(45), "api_" + "a".repeat(45)],
  [
    "Cloudflare CA Key",
    "key=v1.0-" + "A".repeat(171),
    "v1.0-" + "A".repeat(171),
  ],
  ["Deputy URL", "url=mycompany.as.deputy.com", "mycompany.as.deputy.com"],
  ["dfuse API Key", "key=web_" + "a".repeat(32), "web_" + "a".repeat(32)],
  [
    "Documo API Key",
    "key=ey" + "A".repeat(34) + ".ey" + "B".repeat(154) + "." + "C".repeat(43),
    "ey" + "A".repeat(34) + ".ey" + "B".repeat(154) + "." + "C".repeat(43),
  ],
  [
    "dotdigital Email",
    "email=apiuser-abcdef123456@apiconnector.com",
    "apiuser-abcdef123456@apiconnector.com",
  ],
  ["Fibery Domain", "url=https://myworkspace.fibery.io/api", "myworkspace"],
  [
    "Flexport API Key",
    "key=shltm_" + "a".repeat(40),
    "shltm_" + "a".repeat(40),
  ],
  [
    "Fly.io Token",
    "token=FlyV1 fm1_" + "A".repeat(550),
    "FlyV1 fm1_" + "A".repeat(550),
  ],
  [
    "Grafana API Key",
    "key=glc_eyJ" + "A".repeat(80),
    "glc_eyJ" + "A".repeat(80),
  ],
  [
    "Grafana Service Account Domain",
    "url=myorg.grafana.net",
    "myorg.grafana.net",
  ],
  [
    "GraphCMS Token",
    "token=ey" +
      "A".repeat(73) +
      ".ey" +
      "B".repeat(365) +
      "." +
      "C".repeat(683),
    "ey" + "A".repeat(73) + ".ey" + "B".repeat(365) + "." + "C".repeat(683),
  ],
  ["Hasura Domain", "url=myapp.hasura.app", "myapp.hasura.app"],
  [
    "InvoiceOcean URL",
    "url=mycompany.invoiceocean.com",
    "mycompany.invoiceocean.com",
  ],
  ["Kanban URL", "url=myboard.kanbantool.com", "myboard.kanbantool.com"],
  [
    "LiveAgent Domain",
    "url=https://mycompany.ladesk.com",
    "https://mycompany.ladesk.com",
  ],
  ["LocationIQ Key", "key=pk." + "a".repeat(32), "pk." + "a".repeat(32)],
  ["Loggly Domain", "url=myapp.loggly.com", "myapp.loggly.com"],
  ["Mapbox Secret Token", "token=sk." + "a".repeat(80), "sk." + "a".repeat(80)],
  ["mite URL", "url=myteam.mite.yo.lk", "myteam.mite.yo.lk"],
  [
    "MuleSoft Anypoint Key",
    "key=abcdef12-3456-7890-abcd-ef1234567890",
    "abcdef12-3456-7890-abcd-ef1234567890",
  ],
  ["Okta Domain", "url=mycompany.okta.com", "mycompany.okta.com"],
  ["Okta Token", "token=00" + "a".repeat(40), "00" + "a".repeat(40)],
  ["ReadMe API Key", "key=rdme_" + "a".repeat(70), "rdme_" + "a".repeat(70)],
  [
    "Really Simple Systems Key",
    "key=ey" + "a".repeat(153) + ".ey" + "b".repeat(916),
    "ey" + "a".repeat(153) + ".ey" + "b".repeat(916),
  ],
  [
    "Salesforce Access Token",
    "token=00" + "A".repeat(13) + "!" + "a".repeat(96),
    "00" + "A".repeat(13) + "!" + "a".repeat(96),
  ],
  [
    "Salesforce Instance URL",
    "url=https://mycompany.my.salesforce.com",
    "https://mycompany.my.salesforce.com",
  ],
  [
    "Salesforce OAuth2 Consumer Key",
    "key=3MVG9" + "A".repeat(80),
    "3MVG9" + "A".repeat(80),
  ],
  [
    "Salesforce OAuth2 Instance",
    "url=https://mycompany.my.salesforce.com",
    "mycompany.my.salesforce.com",
  ],
  [
    "Sauce Labs URL",
    "url=api.us-west-1.saucelabs.com",
    "api.us-west-1.saucelabs.com",
  ],
  [
    "Sentry Org Auth Token",
    "token=sntrys_eyJ" + "A".repeat(197),
    "sntrys_eyJ" + "A".repeat(197),
  ],
  ["Shopify Access Token", "token=shpat_" + "a".repeat(32), "shpat_"],
  [
    "Tableau Token Secret",
    "secret=" + "A".repeat(22) + "==:" + "B".repeat(32),
    "A".repeat(22) + "==:" + "B".repeat(32),
  ],
  ["Tableau URL", "url=mysite.online.tableau.com", "mysite.online.tableau.com"],
  [
    "Zoho CRM Key",
    "key=1000." + "a".repeat(32) + "." + "b".repeat(32),
    "1000." + "a".repeat(32) + "." + "b".repeat(32),
  ],

  // --- Security & Auth (missing) ---
  [
    "HashiCorp Vault URL",
    "url=https://vault.hashicorp.cloud:8200/v1/secret",
    "https://vault.hashicorp.cloud:8200",
  ],
  [
    "OpenVPN Domain",
    "url=https://myorg.api.openvpn.com",
    "https://myorg.api.openvpn.com",
  ],

  // --- Tokens & Keys (missing) ---
  [
    "Refresh Token",
    "token=0.A" +
      "a".repeat(50) +
      ".1.Ag" +
      "b".repeat(250) +
      ".A" +
      "c".repeat(200),
    "0.A" + "a".repeat(50) + ".1.Ag" + "b".repeat(250) + ".A" + "c".repeat(200),
  ],
  ["Session Key", " " + "A".repeat(100) + "= ", "A".repeat(100) + "="],

  // --- Webhooks & Automation (missing) ---
  [
    "Tines Webhook URL",
    "https://my-tenant.tines.com/webhook/" +
      "a".repeat(32) +
      "/" +
      "b".repeat(32),
    "https://my-tenant.tines.com/webhook/" +
      "a".repeat(32) +
      "/" +
      "b".repeat(32),
  ],

  // --- Infrastructure (missing) ---
  [
    "PubNub Subscribe Key",
    "key=sub-c-12345678-abcd-1234-abcd-123456789012",
    "sub-c-12345678-abcd-1234-abcd-123456789012",
  ],
  [
    "URI with Credentials",
    "https://admin:s3cretP4ss@db.example.com:5432/mydb",
    "s3cretP4ss",
  ],

  // --- Other (missing) ---
  [
    "Atlassian API Token",
    "token=ATCTT3xFfG" + "A".repeat(40) + "=" + "B".repeat(8),
    "ATCTT3xFfG" + "A".repeat(40) + "=" + "B".repeat(8),
  ],
  [
    "Atlassian Bearer Token",
    "token=ATATT" + "A".repeat(40) + "=" + "B".repeat(8),
    "ATATT" + "A".repeat(40) + "=" + "B".repeat(8),
  ],
  [
    "Azure DevOps Token",
    " abc1Q~" + "A".repeat(31) + " ",
    "abc1Q~" + "A".repeat(31),
  ],
  [
    "CircleCI Personal Token",
    "token=CCIPAT_" + "A".repeat(22) + "_" + "a".repeat(40),
    "CCIPAT_" + "A".repeat(22) + "_" + "a".repeat(40),
  ],
  ["Endor Labs Key", "key=endr+" + "A".repeat(16), "endr+" + "A".repeat(16)],
  [
    "Finage API Key",
    "key=API_KEY" + "A".repeat(32),
    "API_KEY" + "A".repeat(32),
  ],
  ["Freshdesk URL", "url=mycompany.freshdesk.com", "mycompany.freshdesk.com"],
  [
    "Generic Secret Key (sk_)",
    "key=sk_" + "a".repeat(48),
    "sk_" + "a".repeat(48),
  ],
  [
    "HubSpot Private App Token",
    "token=pat-na1-" +
      "A".repeat(8) +
      "-" +
      "B".repeat(4) +
      "-" +
      "C".repeat(4) +
      "-" +
      "D".repeat(4) +
      "-" +
      "E".repeat(12),
    "pat-na1-" +
      "A".repeat(8) +
      "-" +
      "B".repeat(4) +
      "-" +
      "C".repeat(4) +
      "-" +
      "D".repeat(4) +
      "-" +
      "E".repeat(12),
  ],
  [
    "Messagebird API Key",
    "key=" + "A".repeat(6) + "_" + "B".repeat(29) + "_mmk",
    "A".repeat(6) + "_" + "B".repeat(29) + "_mmk",
  ],
  ["HubSpot API Key", "key=na1." + "A".repeat(100), "na1." + "A".repeat(100)],
];

// Samples that must NOT match any specific-prefix pattern
const NEGATIVE_SAMPLES = [
  "hello world",
  "just a regular sentence with no secrets",
  "myemail@example.com",
  "https://www.google.com",
  "Authorization: Bearer some-random-token",
  "password=hunter2",
  "SELECT * FROM users WHERE id = 1",
  '{"key": "value", "nested": {"foo": "bar"}}',
  "The quick brown fox jumps over the lazy dog",
  "0123456789abcdef",
];

describe("secret-patterns", () => {
  describe("data integrity", () => {
    it("has patterns defined", () => {
      expect(SECRET_PATTERNS.length).toBeGreaterThan(0);
    });

    it("has all expected categories", () => {
      expect(SECRET_PATTERN_CATEGORIES.length).toBe(12);
    });

    it("every pattern has required fields", () => {
      for (const pattern of SECRET_PATTERNS) {
        expect(pattern.name).toBeTruthy();
        expect(pattern.pattern).toBeTruthy();
        expect(pattern.category).toBeTruthy();
        expect(SECRET_PATTERN_CATEGORIES).toContain(pattern.category);
      }
    });

    it("every pattern compiles as valid JavaScript regex", () => {
      for (const pattern of SECRET_PATTERNS) {
        expect(() => new RegExp(pattern.pattern, "i")).not.toThrow();
      }
    });

    it("has no duplicate pattern names within the same category", () => {
      const seen = new Set<string>();
      for (const pattern of SECRET_PATTERNS) {
        const key = `${pattern.category}:${pattern.name}`;
        expect(seen.has(key), `Duplicate: ${key}`).toBe(false);
        seen.add(key);
      }
    });
  });

  describe("positive matches — each pattern matches its expected sample", () => {
    for (const [name, sample, expected] of POSITIVE_SAMPLES) {
      it(`"${name}" matches expected sample`, () => {
        const pattern = SECRET_PATTERNS.find((p) => p.name === name);
        expect(pattern, `Pattern "${name}" not found`).toBeDefined();

        const match = testMatch(pattern!, sample);
        expect(
          match,
          `Pattern "${name}" did not match sample: ${sample}`,
        ).toBeDefined();
        expect(match).toBe(expected);
      });
    }
  });

  describe("negative matches — plain text does not trigger specific-prefix patterns", () => {
    // Patterns with specific prefixes that should NEVER match plain english
    const specificPrefixPatterns = SECRET_PATTERNS.filter((p) => {
      const raw = p.pattern;
      // Has a literal prefix of 3+ chars (not just character classes)
      return /[A-Za-z]{3,}|https?:|ftp:|\\bsk-|\\bAC\[|\\bSK\[|\\bSG\\./.test(
        raw.substring(0, 40),
      );
    });

    for (const sample of NEGATIVE_SAMPLES) {
      it(`plain text "${sample.substring(0, 40)}..." does not match prefix patterns`, () => {
        const falsePositives: string[] = [];

        for (const pattern of specificPrefixPatterns) {
          const regex = new RegExp(pattern.pattern, "i");
          if (regex.test(sample)) {
            falsePositives.push(pattern.name);
          }
        }

        expect(
          falsePositives,
          `False positives: ${falsePositives.join(", ")}`,
        ).toHaveLength(0);
      });
    }
  });

  describe("no overly generic patterns", () => {
    it("no pattern matches a simple 10-character word", () => {
      const word = "helloworld";
      const matches: string[] = [];

      for (const pattern of SECRET_PATTERNS) {
        const regex = new RegExp(pattern.pattern, "i");
        if (regex.test(word)) {
          matches.push(pattern.name);
        }
      }

      expect(
        matches,
        `Patterns matching "helloworld": ${matches.join(", ")}`,
      ).toHaveLength(0);
    });

    it("no pattern matches a plain UUID", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const matches: string[] = [];

      for (const pattern of SECRET_PATTERNS) {
        const regex = new RegExp(pattern.pattern, "i");
        if (regex.test(uuid)) {
          matches.push(pattern.name);
        }
      }

      // MuleSoft Anypoint Key is UUID-shaped — that's acceptable
      const acceptable = ["MuleSoft Anypoint Key"];
      const unexpected = matches.filter((m) => !acceptable.includes(m));

      expect(
        unexpected,
        `Unexpected patterns matching UUID: ${unexpected.join(", ")}`,
      ).toHaveLength(0);
    });

    it("no pattern matches a plain HTTP response body", () => {
      const body =
        "<html><body><h1>Welcome</h1><p>Hello user</p></body></html>";
      const matches: string[] = [];

      for (const pattern of SECRET_PATTERNS) {
        const regex = new RegExp(pattern.pattern, "i");
        if (regex.test(body)) {
          matches.push(pattern.name);
        }
      }

      expect(
        matches,
        `Patterns matching plain HTML: ${matches.join(", ")}`,
      ).toHaveLength(0);
    });
  });
});
