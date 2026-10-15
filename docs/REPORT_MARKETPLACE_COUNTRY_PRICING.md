# Know Yourself — Country-Adjusted Report Pricing Policy (Draft)

**Applies to:** the first paid product, Life Purpose & Direction.  
**Commercial model:** one-time purchase per report. No subscription dependency.  
**Status:** policy proposal only; no live prices or payment provider selected.

## 1. Pricing principle

Set report prices by the buyer market's ability to pay, not by the country's total GDP and not by a simple live currency conversion. Use a transparent, documented country-pricing schedule based on a combination of:

1. World Bank country income classification (a stable, comparable baseline);
2. purchasing-power-adjusted income per person (for example, GNI per capita at PPP);
3. local digital-content/software price expectations and applicable taxes/payment costs;
4. affordability and conversion data observed after launch.

Country-level indicators are proxies, not a claim that every person in a country has the same income. Do not use a person's birth country, Human Design chart, inferred ethnicity, or a raw IP address alone to determine price.

## 2. Draft pricing bands

Choose one standard reference price for the flagship report, then configure localized fixed prices. These multipliers are **initial hypotheses for testing**, not approved published prices:

| Market affordability band | Initial price index vs. reference |
|---|---:|
| High purchasing-power markets | 100% |
| Upper-middle purchasing-power markets | 70–80% |
| Lower-middle purchasing-power markets | 40–55% |
| Lower purchasing-power markets | 25–35% |

Before publication, map countries to bands using the latest available official data and a documented review date. Permit manual exceptions only with a recorded rationale and approval. Avoid pricing so low that payment processing, taxes, refunds and model-generation costs make each sale uneconomic. Do not advertise a discount against an artificial reference price.

## 3. Local currency and price stability

- Show the customer a fixed local-currency amount where the payment provider supports it; do not expose a floating FX conversion as the storefront price.
- Store prices in integer minor units (or a currency-aware representation for currencies without two decimal places), with ISO currency code, country/market, product version, pricing-policy version, effective dates and tax-treatment metadata.
- Round prices to familiar local price points only after margin and tax checks.
- Snapshot the exact price, currency, tax treatment and pricing-policy version into the purchase at checkout. Later price changes must not alter past purchases.
- Re-evaluate the country matrix quarterly or when major economic/currency changes occur. Record source dates and approval history.
- Where local-currency pricing is unsupported, show a clearly disclosed fallback currency and amount before checkout.

## 4. Market resolution and abuse controls

- Resolve the pricing market from a verified checkout/payment country or equivalent provider-verified billing signal, not solely from client input, browser language or IP geolocation.
- A user may choose a display language independently of their price market.
- Do not ask for sensitive personal information to qualify for regional pricing. If the provider's verified country conflicts with the selected market, use the verified checkout market or fail safely with a clear message.
- Keep market and pricing logic server-side. The client may display the quote but cannot submit an arbitrary price, currency, discount or country tier.
- Apply the same published market rules consistently. Add manual support exceptions only through an auditable server-side process.

## 5. Country availability is separate from price

A country can have a localized price but still be unavailable for purchase if the payment provider cannot legally onboard the merchant, accept that customer, settle funds or support required refunds. Before enabling a country, verify:

- merchant-country eligibility and settlement bank requirements;
- customer-country and payment-method support;
- presentment and settlement currencies and FX costs;
- transaction, cross-border, refund and dispute fees;
- signed webhooks, event IDs/idempotency and retry semantics;
- refund and partial-refund support, tax handling and settlement timing.

Do not choose the payment provider until the merchant's country of registration and settlement setup are known and the provider matrix has been checked against the target markets.

## 6. Implementation contract

The server-side product catalogue should expose a quote for a product and verified market. The quote must include product key/version, market, currency, amount, tax treatment, pricing-policy version, expiry and a server-generated quote identifier. Checkout must use that quote or revalidate it server-side; it must never trust a price supplied by the browser.

Country pricing is a commerce concern outside the 3Framework. It must not change canonical chart facts, evidence, interpretation quality, report sections or PDF content. All paying customers receive the same defined product scope and quality standard; only the market price/currency and legally required tax display may differ.

## 7. Before enabling prices

1. Confirm merchant country of registration and settlement bank.
2. Choose the reference price for Life Purpose & Direction based on production cost, desired margin and market positioning.
3. Build a sourced country-to-band matrix using current official data.
4. Compare payment-provider support and fees for those target markets.
5. Test quote tampering, unsupported markets, price changes between quote and checkout, duplicate webhooks and refunds.
6. Launch with a small, explicitly enabled country list; expand after conversion, refund and margin review.

No live prices are configured by this document. No production database changes or payment integration are made.
