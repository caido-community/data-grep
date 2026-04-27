export const SECRET_PATTERN_CATEGORIES = [
  "Cloud Providers",
  "AI & ML",
  "CI/CD & DevOps",
  "Payment & Finance",
  "Communication",
  "Database & Storage",
  "SaaS & APIs",
  "Security & Auth",
  "Tokens & Keys",
  "Webhooks & Automation",
  "Infrastructure",
  "Other",
] as const;

export type SecretPatternCategory = (typeof SECRET_PATTERN_CATEGORIES)[number];

export interface SecretPattern {
  name: string;
  pattern: string;
  category: SecretPatternCategory;
  matchGroups?: number[];
}

export const SECRET_PATTERNS: SecretPattern[] = [
  // Cloud Providers
  {
    name: "Alibaba Cloud Access Key ID",
    pattern: "\\b(LTAI[a-zA-Z0-9]{17,21})[\\\"';\\s]*",
    category: "Cloud Providers",
  },
  {
    name: "Azure API Management URL",
    pattern: "https://([a-z0-9][a-z0-9-]{0,48}[a-z0-9])\\.azure-api\\.net",
    category: "Cloud Providers",
  },
  {
    name: "Azure App Config Connection String",
    pattern:
      "Endpoint=(https:\\/\\/[a-zA-Z0-9-]+\\.azconfig\\.io);Id=([a-zA-Z0-9+\\/=]+);Secret=([a-zA-Z0-9+\\/=]+)",
    category: "Cloud Providers",
  },
  {
    name: "Azure Batch URL",
    pattern: "https://(.{1,50})\\.(.{1,50})\\.batch\\.azure\\.com",
    category: "Cloud Providers",
  },
  {
    name: "Azure Container Registry Password",
    pattern: "\\b[a-zA-Z0-9+/]{42}\\+ACR[a-zA-Z0-9]{6}\\b",
    category: "Cloud Providers",
  },
  {
    name: "Azure Container Registry URL",
    pattern: "([a-z0-9][a-z0-9-]{1,100}[a-z0-9])\\.azurecr\\.io",
    category: "Cloud Providers",
  },
  {
    name: "Azure Direct Management URL",
    pattern:
      "https://([a-z0-9][a-z0-9-]{0,48}[a-z0-9])\\.management\\.azure-api\\.net",
    category: "Cloud Providers",
  },
  {
    name: "Azure Entra Tenant",
    pattern: "([\\w-]+\\.onmicrosoft\\.com)",
    category: "Cloud Providers",
  },
  {
    name: "Azure Function URL",
    pattern:
      "\\bhttps:\\/\\/([a-zA-Z0-9-]{2,30})\\.azurewebsites\\.net\\/api\\/([a-zA-Z0-9-]{2,30})\\b",
    category: "Cloud Providers",
  },
  {
    name: "Azure SAS Token URL",
    pattern:
      "https://([a-zA-Z0-9][a-z0-9_-]{1,22}[a-zA-Z0-9])\\.blob\\.core\\.windows\\.net/[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?(?:/[a-zA-Z0-9._-]+)*",
    category: "Cloud Providers",
  },
  {
    name: "DigitalOcean Token",
    pattern: "\\b((?:dop|doo|dor)_v1_[a-f0-9]{64})\\b",
    category: "Cloud Providers",
  },
  {
    name: "GCP Application Default Credentials",
    pattern: "\\{[^{]+client_secret[^}]+\\}",
    category: "Cloud Providers",
  },
  {
    name: "GCP Service Account Key",
    pattern: "\\{[^{]+auth_provider_x509_cert_url[^}]+\\}",
    category: "Cloud Providers",
  },
  {
    name: "PlanetScale DB Host",
    pattern: "\\b(aws|gcp)\\.connect\\.psdb\\.cloud\\b",
    category: "Cloud Providers",
  },
  {
    name: "PlanetScale DB Password",
    pattern: "\\bpscale_pw_[A-Za-z0-9_]{43}\\b",
    category: "Cloud Providers",
  },
  {
    name: "PlanetScale Password",
    pattern: "\\bpscale_tkn_[A-Za-z0-9_]{43}\\b",
    category: "Cloud Providers",
  },

  // AI & ML
  {
    name: "Anthropic API Key",
    pattern: "\\b(sk-ant-(?:admin01|api03)-[\\w\\-]{93}AA)\\b",
    category: "AI & ML",
  },
  {
    name: "Gemini Key",
    pattern: "\\b((?:master-|account-)[0-9A-Za-z]{20})\\b",
    category: "AI & ML",
  },
  {
    name: "Groq API Key",
    pattern: "\\b(gsk_[a-zA-Z0-9]{52})\\b",
    category: "AI & ML",
  },
  {
    name: "Hugging Face Token",
    pattern: "\\b(?:hf_|api_org_)[a-zA-Z0-9]{34}\\b",
    category: "AI & ML",
  },
  {
    name: "LangSmith API Key",
    pattern: "\\b(lsv2_(?:pt|sk)_[a-f0-9]{32}_[a-f0-9]{10})\\b",
    category: "AI & ML",
  },
  {
    name: "NVIDIA API Key",
    pattern: "\\b(nvapi-[a-zA-Z0-9_-]{64})\\b",
    category: "AI & ML",
  },
  {
    name: "Replicate API Key",
    pattern: "\\b(r8_[0-9A-Za-z-_]{37})\\b",
    category: "AI & ML",
  },
  {
    name: "Sourcegraph Cody Token",
    pattern: "\\b(slk_[a-f0-9]{64})\\b",
    category: "AI & ML",
  },
  {
    name: "xAI API Key",
    pattern: "\\b(xai-[0-9a-zA-Z_]{80})\\b",
    category: "AI & ML",
  },

  // CI/CD & DevOps
  {
    name: "Doppler Token",
    pattern:
      "\\b(dp\\.(?:ct|pt|st(?:\\.[a-z0-9\\-_]{2,35})?|sa|scim|audit)\\.[a-zA-Z0-9]{40,44})\\b",
    category: "CI/CD & DevOps",
  },
  {
    name: "JFrog Artifactory URL",
    pattern: "\\b([A-Za-z0-9][A-Za-z0-9\\-]{0,61}[A-Za-z0-9]\\.jfrog\\.io)",
    category: "CI/CD & DevOps",
  },
  {
    name: "LaunchDarkly Key",
    pattern:
      "\\b((?:api|sdk)-[a-z0-9]{8}-[a-z0-9]{4}-4[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{12})\\b",
    category: "CI/CD & DevOps",
  },
  {
    name: "NPM Token",
    pattern: "(npm_[0-9a-zA-Z]{36})",
    category: "CI/CD & DevOps",
  },
  {
    name: "Prefect API Key",
    pattern: "\\b(pnu_[a-zA-Z0-9]{36})\\b",
    category: "CI/CD & DevOps",
  },
  {
    name: "Pulumi Access Token",
    pattern: "\\b(pul-[a-z0-9]{40})\\b",
    category: "CI/CD & DevOps",
  },
  {
    name: "RubyGems API Key",
    pattern: "\\b(rubygems_[a-zA-Z0-9]{48})\\b",
    category: "CI/CD & DevOps",
  },
  {
    name: "Sourcegraph Token",
    pattern:
      "\\b(sgp_(?:[a-fA-F0-9]{16}|local)_[a-fA-F0-9]{40}|sgp_[a-fA-F0-9]{40}|[a-fA-F0-9]{40})\\b",
    category: "CI/CD & DevOps",
  },
  {
    name: "Terraform Cloud Token",
    pattern: "\\b([A-Za-z0-9]{14}.atlasv1.[A-Za-z0-9]{67})\\b",
    category: "CI/CD & DevOps",
  },
  {
    name: "TruffleHog Enterprise Hostname",
    pattern:
      "\\b[a-z]+-[a-z]+-[a-z]+\\.[a-z][0-9]\\.[a-z]+\\.trufflehog\\.org\\b",
    category: "CI/CD & DevOps",
  },
  {
    name: "TruffleHog Enterprise Key",
    pattern: "\\bthog-key-[0-9a-f]{16}\\b",
    category: "CI/CD & DevOps",
  },
  {
    name: "TruffleHog Enterprise Secret",
    pattern: "\\bthog-secret-[0-9a-f]{32}\\b",
    category: "CI/CD & DevOps",
  },

  // Payment & Finance
  {
    name: "Coinbase Key Name",
    pattern:
      "\\b(organizations\\\\*/\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}\\\\*/apiKeys\\\\*/\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12})\\b",
    category: "Payment & Finance",
  },
  {
    name: "Coinbase Private Key",
    pattern:
      "(-----BEGIN EC(?:DSA)? PRIVATE KEY-----(?:\\r|\\n|\\\\+r|\\\\+n)(?:[a-zA-Z0-9+/]+={0,2}(?:\\r|\\n|\\\\+r|\\\\+n))+-----END EC(?:DSA)? PRIVATE KEY-----(?:\\r|\\n|\\\\+r|\\\\+n)?)",
    category: "Payment & Finance",
  },
  {
    name: "Flutterwave Key",
    pattern: "\\b(FLWSECK-[0-9a-z]{32}-X)\\b",
    category: "Payment & Finance",
  },
  {
    name: "GoCardless Key",
    pattern: "\\b(live_[0-9A-Za-z\\_\\-]{40}[ \"'\\r\\n]{1})",
    category: "Payment & Finance",
  },
  {
    name: "Pagar.me Key",
    pattern: "\\b(ak_live_[a-zA-Z0-9]{30})\\b",
    category: "Payment & Finance",
  },
  {
    name: "PayPal OAuth Client ID",
    pattern:
      "\\b([A-Za-z0-9_\\.]{7}-[A-Za-z0-9_\\.]{72}|[A-Za-z0-9_\\.]{5}-[A-Za-z0-9_\\.]{38})\\b",
    category: "Payment & Finance",
  },
  {
    name: "Paystack Key",
    pattern: "\\b(sk\\_[a-z]{1,}\\_[A-Za-z0-9]{40})\\b",
    category: "Payment & Finance",
  },
  {
    name: "Robinhood Crypto Key",
    pattern:
      "\\b(rh-api-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\\b",
    category: "Payment & Finance",
  },
  {
    name: "Robinhood Crypto Private Key",
    pattern:
      "(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\\/]{3}=)",
    category: "Payment & Finance",
  },
  {
    name: "Square App Key",
    pattern: "(?:sandbox-)?sq0i[a-z]{2}-[0-9A-Za-z_-]{22,43}",
    category: "Payment & Finance",
  },
  {
    name: "Square App Secret",
    pattern: "(?:sandbox-)?sq0c[a-z]{2}-[0-9A-Za-z_-]{40,50}",
    category: "Payment & Finance",
  },
  {
    name: "Square Key",
    pattern: "\\b(sq0idp-[0-9A-Za-z]{22})\\b",
    category: "Payment & Finance",
  },
  {
    name: "Stripe Client Secret",
    pattern: "\\b(pi_[a-zA-Z0-9]{24}_secret_[a-zA-Z0-9]{25})\\b",
    category: "Payment & Finance",
  },
  {
    name: "Stripe Publishable Key",
    pattern: "\\b(pk_live_[a-zA-Z0-9]{20,247})\\b",
    category: "Payment & Finance",
  },
  {
    name: "Stripe Secret Key",
    pattern: "\\b([rs]k_live_[a-zA-Z0-9]{20,247})\\b",
    category: "Payment & Finance",
  },

  // Communication
  {
    name: "Brevo (Sendinblue) Key",
    pattern: "\\b(xkeysib\\-[A-Za-z0-9_-]{81})\\b",
    category: "Communication",
  },
  {
    name: "Discord Webhook URL",
    pattern:
      "(https:\\/\\/discord\\.com\\/api\\/webhooks\\/[0-9]{18,19}\\/[0-9a-zA-Z-]{68})",
    category: "Communication",
  },
  {
    name: "Mailchimp API Key",
    pattern: "[0-9a-f]{32}-us[0-9]{1,2}",
    category: "Communication",
  },
  {
    name: "Microsoft Teams Webhook",
    pattern:
      "(https:\\/\\/[a-zA-Z-0-9]+\\.webhook\\.office\\.com\\/webhookb2\\/[a-zA-Z-0-9]{8}-[a-zA-Z-0-9]{4}-[a-zA-Z-0-9]{4}-[a-zA-Z-0-9]{4}-[a-zA-Z-0-9]{12}\\@[a-zA-Z-0-9]{8}-[a-zA-Z-0-9]{4}-[a-zA-Z-0-9]{4}-[a-zA-Z-0-9]{4}-[a-zA-Z-0-9]{12}\\/IncomingWebhook\\/[a-zA-Z-0-9]{32}\\/[a-zA-Z-0-9]{8}-[a-zA-Z-0-9]{4}-[a-zA-Z-0-9]{4}-[a-zA-Z-0-9]{4}-[a-zA-Z-0-9]{12})",
    category: "Communication",
  },
  {
    name: "Postman API Key",
    pattern: "\\b(PMAK-[a-zA-Z-0-9]{59})\\b",
    category: "Communication",
  },
  {
    name: "SendGrid API Key",
    pattern: "\\bSG\\.[\\w\\-]{20,24}\\.[\\w\\-]{39,50}\\b",
    category: "Communication",
  },
  {
    name: "SignalWire URL",
    pattern: "\\b([0-9a-z-]{3,64}\\.signalwire\\.com)\\b",
    category: "Communication",
  },
  {
    name: "Twilio Account SID",
    pattern: "\\bAC[0-9a-f]{32}\\b",
    category: "Communication",
  },
  {
    name: "Twilio API Key",
    pattern: "\\bSK[a-zA-Z0-9]{32}\\b",
    category: "Communication",
  },
  {
    name: "Voiceflow API Key",
    pattern: "\\b(VF\\.(?:(?:DM|WS)\\.)?[a-fA-F0-9]{24}\\.[a-zA-Z0-9]{16})\\b",
    category: "Communication",
  },
  {
    name: "Webex Bot Token",
    pattern:
      "([a-zA-Z0-9]{64}_[a-zA-Z0-9]{4}_[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})",
    category: "Communication",
  },

  // Database & Storage
  {
    name: "Azure Redis Connection",
    pattern:
      "\\b([\\w\\d.-]{1,100}\\.redis\\.cache\\.windows\\.net:6380),password=([^,]{44}),ssl=True,abortConnect=False\\b",
    category: "Database & Storage",
  },
  {
    name: "Couchbase Connection String",
    pattern: "\\b(cb\\.[a-z0-9]+\\.cloud\\.couchbase\\.com)\\b",
    category: "Database & Storage",
  },
  {
    name: "MongoDB Placeholder Password",
    pattern: "^[xX]+|\\*+$",
    category: "Database & Storage",
  },
  {
    name: "RabbitMQ Credentials",
    pattern: "\\b(?:amqps?):\\/\\/[\\S]{3,50}:([\\S]{3,50})@[-.%\\w\\/:]+\\b",
    category: "Database & Storage",
  },
  {
    name: "Redis Password",
    pattern: "\\bredi[s]{1,2}://[\\S]{3,50}:([\\S]{3,50})@[-.%\\w\\/:]+\\b",
    category: "Database & Storage",
  },
  {
    name: "Supabase Token",
    pattern: "\\b(sbp_[a-z0-9]{40})\\b",
    category: "Database & Storage",
  },

  // SaaS & APIs
  {
    name: "42 Intra Client ID",
    pattern: "\\b(u-s4t2(?:ud|af)-[a-f0-9]{64})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "42 Intra Client Secret",
    pattern: "\\b(s-s4t2(?:ud|af)-[a-f0-9]{64})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Aha! URL",
    pattern: "\\b([A-Za-z0-9](?:[A-Za-z0-9\\-]{0,61}[A-Za-z0-9])\\.aha\\.io)",
    category: "SaaS & APIs",
  },
  {
    name: "Apideck API Key",
    pattern: "\\b(sk_live_[a-z0-9A-Z-]{93})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Apify Token",
    pattern: "\\b(apify\\_api\\_[a-zA-Z-0-9]{36})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Auth0 Management API Token",
    pattern: "\\b(ey[a-zA-Z0-9._-]+)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Auth0 Management Domain",
    pattern: "([a-zA-Z0-9\\-]{2,16}\\.[a-zA-Z0-9_-]{2,3}\\.auth0\\.com)",
    category: "SaaS & APIs",
  },
  {
    name: "Auth0 OAuth Domain",
    pattern: "\\b([a-zA-Z0-9][a-zA-Z0-9._-]*auth0\\.com)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Caflou API Key",
    pattern: "\\b(eyJhbGciOiJIUzI1NiJ9[a-zA-Z0-9._-]{135})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "ClickHelp Portal",
    pattern: "\\b([0-9A-Za-z-]{3,20}\\.(?:try\\.)?clickhelp\\.co)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Close CRM Key",
    pattern: "\\b(api_[a-z0-9A-Z.]{45})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Cloudflare CA Key",
    pattern: "\\b(v1\\.0-[A-Za-z0-9-]{171})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Contentful Access Token",
    pattern: "\\b(CFPAT-[a-zA-Z0-9_\\-]{43})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Deputy URL",
    pattern: "\\b([0-9a-z]{1,}\\.as\\.deputy\\.com)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "dfuse API Key",
    pattern: "\\b(web\\_[0-9a-z]{32})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Documo API Key",
    pattern: "\\b(ey[a-zA-Z0-9]{34}.ey[a-zA-Z0-9]{154}.[a-zA-Z0-9_-]{43})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "dotdigital Email",
    pattern: "\\b(apiuser-[a-z0-9]{12}@apiconnector.com)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Fibery Domain",
    pattern: "(?:https?:\\/\\/)?([a-zA-Z0-9-]{1,63})\\.fibery\\.io(?:\\/.*)?",
    category: "SaaS & APIs",
  },
  {
    name: "Fleetbase Key",
    pattern: "\\b(flb_live_[0-9a-zA-Z]{20})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Flexport API Key",
    pattern: "\\b(shltm_[0-9a-zA-Z-_]{40})",
    category: "SaaS & APIs",
  },
  {
    name: "Fly.io Token",
    pattern: "\\b(FlyV1 fm\\d+_[A-Za-z0-9+\\/=,_-]{500,700})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Frame.io Token",
    pattern: "\\b(fio-u-[0-9a-zA-Z_-]{64})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Grafana API Key",
    pattern: "\\b(glc_eyJ[A-Za-z0-9+\\/=]{60,160})",
    category: "SaaS & APIs",
  },
  {
    name: "Grafana Service Account Domain",
    pattern: "\\b([a-zA-Z0-9-]+\\.grafana\\.net)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Grafana Service Account Key",
    pattern: "\\b(glsa_[0-9a-zA-Z_]{41})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "GraphCMS Token",
    pattern: "\\b(ey[a-zA-Z0-9]{73}.ey[a-zA-Z0-9]{365}.[a-zA-Z0-9_-]{683})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Hasura Domain",
    pattern: "\\b([a-zA-Z0-9-]+\\.hasura\\.app)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "InvoiceOcean URL",
    pattern: "\\b([0-9a-z]{1,}\\.invoiceocean\\.com)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Kanban URL",
    pattern: "\\b([0-9a-z]{1,}\\.kanbantool\\.com)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Linear API Key",
    pattern: "\\b(lin_api_[0-9A-Za-z]{40})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "LiveAgent Domain",
    pattern: "\\b(https?://[A-Za-z0-9-]+\\.ladesk\\.com)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "LocationIQ Key",
    pattern: "\\b(pk\\.[a-zA-Z-0-9]{32})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Loggly Domain",
    pattern: "\\b([a-zA-Z0-9-]+\\.loggly\\.com)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Mapbox Secret Token",
    pattern: "\\b(sk\\.[a-zA-Z-0-9\\.]{80,240})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "mite URL",
    pattern: "\\b([0-9a-z-]{1,}.mite.yo.lk)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "MuleSoft Anypoint Key",
    pattern:
      "\\b([0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Notion API Key",
    pattern: "\\b(secret_[A-Za-z0-9]{43})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Okta Domain",
    pattern: "\\b[a-z0-9-]{1,40}\\.okta(?:preview|-emea){0,1}\\.com\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Okta Token",
    pattern: "\\b00[a-zA-Z0-9_-]{40}\\b",
    category: "SaaS & APIs",
  },
  {
    name: "PostHog API Key",
    pattern: "\\b(phx_[a-zA-Z0-9_]{43})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "ReadMe API Key",
    pattern: "(rdme_[a-z0-9]{70})",
    category: "SaaS & APIs",
  },
  {
    name: "Really Simple Systems Key",
    pattern: "\\b(ey[a-zA-Z0-9-._]{153}.ey[a-zA-Z0-9-._]{916,1000})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Rootly API Key",
    pattern: "\\b(rootly_[a-f0-9]{64})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Salesforce Access Token",
    pattern: "\\b00[a-zA-Z0-9]{13}![a-zA-Z0-9_.]{96}\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Salesforce Instance URL",
    pattern: "\\bhttps://[0-9a-zA-Z-\\.]{1,100}\\.my\\.salesforce\\.com\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Salesforce OAuth2 Consumer Key",
    pattern: "\\b(3MVG9[0-9a-zA-Z._+/=]{80,251})",
    category: "SaaS & APIs",
  },
  {
    name: "Salesforce OAuth2 Instance",
    pattern:
      "\\b(?:https?://)?([0-9a-zA-Z\\-\\.]{1,100}\\.my\\.salesforce\\.com)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Sauce Labs URL",
    pattern:
      "\\b(api\\.(?:us|eu)-(?:west|east|central)-[0-9].saucelabs\\.com)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Sentry Org Auth Token",
    pattern: "\\b(sntrys_eyJ[a-zA-Z0-9=_+/]{197})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Shopify Access Token",
    pattern: "\\b((?:shppa_|shpat_)[0-9A-Fa-f]{32})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Shopify Domain",
    pattern: "[a-zA-Z0-9-]+\\.myshopify\\.com",
    category: "SaaS & APIs",
  },
  {
    name: "Tableau Token Secret",
    pattern: "\\b([A-Za-z0-9+/]{22}==:[A-Za-z0-9]{32})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Tableau URL",
    pattern: "\\b([a-zA-Z0-9\\-]+\\.online\\.tableau\\.com)\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Ubidots API Key",
    pattern: "\\b(BBFF-[0-9a-zA-Z]{30})\\b",
    category: "SaaS & APIs",
  },
  {
    name: "Zoho CRM Key",
    pattern: "\\b(1000\\.[a-f0-9]{32}\\.[a-f0-9]{32})\\b",
    category: "SaaS & APIs",
  },

  // Security & Auth
  {
    name: "HashiCorp Vault URL",
    pattern:
      "(https?:\\/\\/[^\\s\\/]*\\.hashicorp\\.cloud(?::\\d+)?)(?:\\/[^\\s]*)?",
    category: "Security & Auth",
  },
  {
    name: "OpenVPN Domain",
    pattern: "\\b(https?://[A-Za-z0-9-]+\\.api\\.openvpn\\.com)\\b",
    category: "Security & Auth",
  },
  {
    name: "Tailscale API Key",
    pattern: "\\btskey-[a-z]+-[0-9A-Za-z_]+-[0-9A-Za-z_]+\\b",
    category: "Security & Auth",
  },

  // Tokens & Keys
  {
    name: "Access Key ID",
    pattern: "\\b((?:AKIA|ABIA|ACCA)[A-Z0-9]{16})\\b",
    category: "Tokens & Keys",
  },
  {
    name: "Refresh Token",
    pattern:
      "\\b[01]\\.A[\\w-]{50,}(?:\\.\\d)?\\.Ag[\\w-]{250,}(?:\\.A[\\w-]{200,})?",
    category: "Tokens & Keys",
  },
  {
    name: "Session Key",
    pattern: "(?<![A-Za-z0-9+/])([a-zA-Z0-9+/]{100,}={0,3})(?![A-Za-z0-9+/=])",
    category: "Tokens & Keys",
  },
  {
    name: "Session Key ID",
    pattern: "\\b((?:ASIA)[A-Z0-9]{16})\\b",
    category: "Tokens & Keys",
  },

  // Webhooks & Automation
  {
    name: "Tines Webhook URL",
    pattern:
      "(https://[\\w-]+\\.tines\\.com/webhook/[a-z0-9]{32}/[a-z0-9]{32})",
    category: "Webhooks & Automation",
  },
  {
    name: "Zapier Webhook URL",
    pattern:
      "(https:\\/\\/hooks\\.zapier\\.com\\/hooks\\/catch\\/[A-Za-z0-9\\/]{16})",
    category: "Webhooks & Automation",
  },

  // Infrastructure
  {
    name: "FTP Credentials",
    pattern: "\\bftp://[\\S]{3,50}:([\\S]{3,50})@[-.%\\w\\/:]+\\b",
    category: "Infrastructure",
  },
  {
    name: "PubNub Publish Key",
    pattern:
      "\\b(pub-c-[0-9a-z]{8}-[0-9a-z]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})\\b",
    category: "Infrastructure",
  },
  {
    name: "PubNub Subscribe Key",
    pattern:
      "\\b(sub-c-[0-9a-z]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})\\b",
    category: "Infrastructure",
  },
  {
    name: "URI with Credentials",
    pattern:
      "\\bhttps?:\\/\\/[\\w!#$%&()*+,\\-./;<=>?@[\\\\\\]^_{|}~]{0,50}:([\\w!#$%&()*+,\\-./:;<=>?[\\\\\\]^_{|}~]{3,50})@[a-zA-Z0-9.-]+(?:\\.[a-zA-Z]{2,})?(?::\\d{1,5})?[\\w/]+\\b",
    category: "Infrastructure",
  },

  // Other
  {
    name: "Adafruit IO Key",
    pattern: "\\b(aio\\_[a-zA-Z0-9]{28})\\b",
    category: "Other",
  },
  {
    name: "Atlassian API Token",
    pattern: "\\b(ATCTT3xFfG[A-Za-z0-9+/=_-]+=[A-Za-z0-9]{8})\\b",
    category: "Other",
  },
  {
    name: "Atlassian Bearer Token",
    pattern: "\\b(ATATT[A-Za-z0-9+/=_-]+=[A-Za-z0-9]{8})\\b",
    category: "Other",
  },
  {
    name: "Azure DevOps Token",
    pattern:
      "(?<![a-zA-Z0-9_~.-])([a-zA-Z0-9_~.-]{3}\\dQ~[a-zA-Z0-9_~.-]{31,34})(?![a-zA-Z0-9_~.-])",
    category: "Other",
  },
  {
    name: "Buildkite Agent Token",
    pattern: "\\b(bkua_[a-z0-9]{40})\\b",
    category: "Other",
  },
  {
    name: "CircleCI Personal Token",
    pattern: "(CCIPAT_[a-zA-Z0-9]{22}_[a-fA-F0-9]{40})",
    category: "Other",
  },
  {
    name: "Databricks Token",
    pattern: "\\b(dapi[0-9a-f]{32}(-\\d)?)\\b",
    category: "Other",
  },
  {
    name: "Deno Deploy Token",
    pattern: "\\b(dd[pw]_[a-zA-Z0-9]{36})\\b",
    category: "Other",
  },
  {
    name: "Endor Labs Key",
    pattern: "\\b(endr\\+[a-zA-Z0-9-]{16})\\b",
    category: "Other",
  },
  {
    name: "Finage API Key",
    pattern: "\\b(API_KEY[0-9A-Z]{32})\\b",
    category: "Other",
  },
  {
    name: "Freshdesk URL",
    pattern: "\\b([0-9a-z-]{1,}\\.freshdesk\\.com)\\b",
    category: "Other",
  },
  {
    name: "Generic Secret Key (sk_)",
    pattern: "\\b((?:sk)_[a-f0-9]{48})\\b",
    category: "Other",
  },
  {
    name: "GitHub Token",
    pattern: "\\b((?:ghp|gho|ghu|ghs|ghr|github_pat)_[a-zA-Z0-9_]{36,255})\\b",
    category: "Other",
  },
  {
    name: "GitLab Personal Access Token",
    pattern: "\\b(glpat-[a-zA-Z0-9\\-=_]{20,22})\\b",
    category: "Other",
  },
  {
    name: "Heroku API Key",
    pattern: "\\b(HRKU-AA[0-9a-zA-Z_-]{58})\\b",
    category: "Other",
  },
  {
    name: "HubSpot Private App Token",
    pattern:
      "\\b(pat-(?:eu|na)1-[A-Za-z0-9]{8}\\-[A-Za-z0-9]{4}\\-[A-Za-z0-9]{4}\\-[A-Za-z0-9]{4}\\-[A-Za-z0-9]{12})\\b",
    category: "Other",
  },
  {
    name: "Messagebird API Key",
    pattern: "\\b([a-zA-Z0-9]{6}_[a-zA-Z0-9]{29}_mmk)\\b",
    category: "Other",
  },
  {
    name: "Nightfall Key",
    pattern: "\\b(NF\\-[a-zA-Z0-9]{32})\\b",
    category: "Other",
  },
  {
    name: "Sentry User Auth Token",
    pattern: "\\b(sntryu_[a-f0-9]{64})\\b",
    category: "Other",
  },
  {
    name: "Bitbucket App Password",
    pattern: "\\b(bb_(?:pr|ma)_[a-f0-9]{30})\\b",
    category: "Other",
  },
  {
    name: "Docker Access Token",
    pattern:
      "\\b(dckr_pat_[a-zA-Z0-9_-]{27}|dckr_oat_[a-zA-Z0-9_-]{32})(?![a-zA-Z0-9_-])",
    category: "Other",
  },
  {
    name: "HubSpot API Key",
    pattern: "\\b(na1\\.[A-Za-z0-9\\+\\/]{100})\\b",
    category: "Other",
  },
  {
    name: "Terraform Cloud Team Token",
    pattern: "\\btfp_[a-zA-Z0-9_]{40,59}\\b",
    category: "Other",
  },
];
