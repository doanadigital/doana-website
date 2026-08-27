(() => {

  "use strict";


  // =====================================================
  // DOANA DIGITAL
  // REGIONAL PRICING SYSTEM
  //
  // Priority:
  //
  // 1. Manual / detected country
  // 2. Exact pricing override
  // 3. USD base × exchange rate × market multiplier
  // 4. USD fallback
  // =====================================================



  // =====================================================
  // SUPABASE
  // =====================================================

  const SUPABASE_URL =
    "https://efbmmxtteekbjayiesft.supabase.co";


  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";



  // =====================================================
  // STORAGE
  // =====================================================

  const COUNTRY_CACHE_KEY =
    "doanaPricingCountry";


  const COUNTRY_CACHE_TIME_KEY =
    "doanaPricingCountryTime";


  const MANUAL_COUNTRY_KEY =
    "doanaManualPricingCountry";


  const COUNTRY_CACHE_DURATION =
    1000 *
    60 *
    60 *
    24;



  // =====================================================
  // FALLBACK
  // =====================================================

  const FALLBACK_REGION = {

    country_code:
      "US",

    country_name:
      "United States",

    currency_code:
      "USD",

    currency_symbol:
      "$",

    exchange_rate:
      1,

    market_multiplier:
      1,

    active:
      true

  };



  // =====================================================
  // STATE
  // =====================================================

  let pricingData = {

    services:
      [],

    regions:
      [],

    overrides:
      []

  };


  let activeRegion =
    FALLBACK_REGION;



  // =====================================================
  // SUPABASE GET
  // =====================================================

  async function supabaseRequest(
    path
  ) {

    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/${path}`,

        {

          method:
            "GET",

          headers: {

            apikey:
              SUPABASE_PUBLISHABLE_KEY,

            Accept:
              "application/json"

          }

        }

      );


    if (!response.ok) {

      const errorText =
        await response.text();


      throw new Error(
        `Supabase pricing request failed: ${response.status} ${errorText}`
      );

    }


    return await response.json();

  }



  // =====================================================
  // FETCH WITH TIMEOUT
  // =====================================================

  async function fetchWithTimeout(
    url,
    milliseconds = 4500
  ) {

    const controller =
      new AbortController();


    const timer =
      window.setTimeout(
        () => {

          controller.abort();

        },
        milliseconds
      );


    try {

      return await fetch(
        url,
        {
          signal:
            controller.signal,

          cache:
            "no-store"
        }
      );


    } finally {

      window.clearTimeout(
        timer
      );

    }

  }



  // =====================================================
  // MANUAL COUNTRY
  // =====================================================

  function getManualCountry() {

    try {

      return localStorage.getItem(
        MANUAL_COUNTRY_KEY
      );

    } catch {

      return null;

    }

  }



  function saveManualCountry(
    countryCode
  ) {

    try {

      if (countryCode) {

        localStorage.setItem(
          MANUAL_COUNTRY_KEY,
          countryCode
        );


      } else {

        localStorage.removeItem(
          MANUAL_COUNTRY_KEY
        );

      }

    } catch {

      // Storage unavailable.

    }

  }



  // =====================================================
  // COUNTRY CACHE
  // =====================================================

  function getCachedCountry() {

    try {

      const country =
        localStorage.getItem(
          COUNTRY_CACHE_KEY
        );


      const timestamp =
        Number(
          localStorage.getItem(
            COUNTRY_CACHE_TIME_KEY
          )
        );


      if (
        !country ||
        !timestamp
      ) {

        return null;

      }


      if (
        Date.now() -
        timestamp >
        COUNTRY_CACHE_DURATION
      ) {

        return null;

      }


      return country;

    } catch {

      return null;

    }

  }



  function cacheCountry(
    countryCode
  ) {

    try {

      localStorage.setItem(
        COUNTRY_CACHE_KEY,
        countryCode
      );


      localStorage.setItem(
        COUNTRY_CACHE_TIME_KEY,
        String(
          Date.now()
        )
      );

    } catch {

      // Storage unavailable.

    }

  }



  // =====================================================
  // COUNTRY LOOKUP — IPWHO.IS
  // =====================================================

  async function detectCountryWithIpWho() {

    const response =
      await fetchWithTimeout(
        "https://ipwho.is/",
        4500
      );


    if (!response.ok) {

      throw new Error(
        "ipwho.is unavailable"
      );

    }


    const data =
      await response.json();


    if (
      data.success !== true ||
      !data.country_code
    ) {

      throw new Error(
        "ipwho.is returned no country"
      );

    }


    return String(
      data.country_code
    )
      .trim()
      .toUpperCase();

  }



  // =====================================================
  // COUNTRY LOOKUP — IPAPI
  // FALLBACK PROVIDER
  // =====================================================

  async function detectCountryWithIpApi() {

    const response =
      await fetchWithTimeout(
        "https://ipapi.co/json/",
        4500
      );


    if (!response.ok) {

      throw new Error(
        "ipapi.co unavailable"
      );

    }


    const data =
      await response.json();


    if (!data.country_code) {

      throw new Error(
        "ipapi.co returned no country"
      );

    }


    return String(
      data.country_code
    )
      .trim()
      .toUpperCase();

  }



  // =====================================================
  // DETECT COUNTRY
  // =====================================================

  async function detectCountry() {

    // User manually selected country.
    const manual =
      getManualCountry();


    if (manual) {

      return manual;

    }


    // Recently detected country.
    const cached =
      getCachedCountry();


    if (cached) {

      return cached;

    }


    // Provider 1
    try {

      const country =
        await detectCountryWithIpWho();


      cacheCountry(
        country
      );


      return country;


    } catch (error) {

      console.warn(
        "Primary country detection failed:",
        error
      );

    }


    // Provider 2
    try {

      const country =
        await detectCountryWithIpApi();


      cacheCountry(
        country
      );


      return country;


    } catch (error) {

      console.warn(
        "Secondary country detection failed:",
        error
      );

    }


    // Never leave UI waiting.
    return "US";

  }



  // =====================================================
  // LOAD PRICING
  // =====================================================

  async function loadPricingData() {

    const [
      services,
      regions,
      overrides
    ] =
      await Promise.all([

        supabaseRequest(
          "services_pricing" +
          "?select=" +
          "service_code," +
          "service_name," +
          "base_price_usd," +
          "price_type," +
          "active" +
          "&active=eq.true" +
          "&order=id.asc"
        ),


        supabaseRequest(
          "pricing_regions" +
          "?select=" +
          "country_code," +
          "country_name," +
          "currency_code," +
          "currency_symbol," +
          "exchange_rate," +
          "market_multiplier," +
          "active" +
          "&active=eq.true" +
          "&order=country_name.asc"
        ),


        supabaseRequest(
          "pricing_overrides" +
          "?select=" +
          "service_code," +
          "country_code," +
          "local_price"
        )

      ]);


    return {

      services:
        Array.isArray(
          services
        )
          ? services
          : [],


      regions:
        Array.isArray(
          regions
        )
          ? regions
          : [],


      overrides:
        Array.isArray(
          overrides
        )
          ? overrides
          : []

    };

  }



  // =====================================================
  // FIND REGION
  // =====================================================

  function findRegion(
    countryCode
  ) {

    const region =
      pricingData.regions.find(
        item =>
          item.country_code ===
          countryCode
      );


    if (region) {

      return region;

    }


    const us =
      pricingData.regions.find(
        item =>
          item.country_code ===
          "US"
      );


    return us ||
      FALLBACK_REGION;

  }



  // =====================================================
  // FIND OVERRIDE
  // =====================================================

  function findOverride(
    serviceCode,
    countryCode
  ) {

    return pricingData
      .overrides
      .find(
        item =>
          item.service_code ===
            serviceCode
          &&
          item.country_code ===
            countryCode
      );

  }



  // =====================================================
  // CALCULATE PRICE
  // =====================================================

  function calculatePrice(
    service,
    region
  ) {

    const override =
      findOverride(

        service.service_code,

        region.country_code

      );


    // Exact regional override wins.

    if (
      override &&
      Number.isFinite(
        Number(
          override.local_price
        )
      )
    ) {

      return {

        amount:
          Number(
            override.local_price
          ),

        source:
          "override"

      };

    }



    const baseUsd =
      Number(
        service.base_price_usd
      );


    const exchangeRate =
      Number(
        region.exchange_rate
      );


    const marketMultiplier =
      Number(
        region.market_multiplier
      );



    if (
      Number.isFinite(baseUsd) &&
      Number.isFinite(exchangeRate) &&
      Number.isFinite(marketMultiplier)
    ) {

      return {

        amount:
          baseUsd *
          exchangeRate *
          marketMultiplier,

        source:
          "calculated"

      };

    }



    return {

      amount:
        Number.isFinite(baseUsd)
          ? baseUsd
          : 0,

      source:
        "usd-fallback"

    };

  }



  // =====================================================
  // COMMERCIAL ROUNDING
  // =====================================================

  function commercialRound(
    amount,
    currencyCode,
    source
  ) {

    // Never modify manually configured prices.

    if (
      source ===
      "override"
    ) {

      return amount;

    }



    if (
      currencyCode ===
      "INR"
    ) {

      return (
        Math.round(
          amount /
          100
        )
        *
        100
      );

    }



    if (
      currencyCode ===
      "AED"
    ) {

      return (
        Math.round(
          amount /
          5
        )
        *
        5
      );

    }



    return Math.round(
      amount
    );

  }



  // =====================================================
  // FORMAT PRICE
  // =====================================================

  function formatCurrency(
    amount,
    currencyCode
  ) {

    try {

      return new Intl.NumberFormat(

        undefined,

        {

          style:
            "currency",

          currency:
            currencyCode,

          minimumFractionDigits:
            0,

          maximumFractionDigits:
            0

        }

      ).format(
        amount
      );


    } catch (error) {

      console.warn(
        "Currency formatting failed:",
        error
      );


      return `${currencyCode} ${amount}`;

    }

  }



  // =====================================================
  // PRICE LABEL
  // =====================================================

  function createPriceLabel(
    service,
    region
  ) {

    if (
      service.price_type ===
      "contact"
    ) {

      return "Contact for pricing";

    }


    const result =
      calculatePrice(
        service,
        region
      );


    const finalPrice =
      commercialRound(

        result.amount,

        region.currency_code,

        result.source

      );


    const formatted =
      formatCurrency(

        finalPrice,

        region.currency_code

      );


    if (
      service.price_type ===
      "fixed"
    ) {

      return formatted;

    }


    return `Starting at ${formatted}`;

  }



  // =====================================================
  // RENDER SERVICE PRICES
  // =====================================================

  function renderPrices(
    region
  ) {

    document
      .querySelectorAll(
        "[data-service-code]"
      )
      .forEach(
        card => {

          const serviceCode =
            card.dataset.serviceCode;


          const service =
            pricingData.services.find(
              item =>
                item.service_code ===
                serviceCode
            );


          const priceElement =
            card.querySelector(
              "[data-service-price]"
            );


          if (!priceElement) {

            return;

          }


          if (!service) {

            priceElement.textContent =
              "Contact for pricing";


            console.warn(
              `Pricing service not found: ${serviceCode}`
            );


            return;

          }


          priceElement.textContent =
            createPriceLabel(
              service,
              region
            );

        }
      );

  }



  // =====================================================
  // LOCATION CONTROLLER
  // =====================================================

  function renderLocationControl(
    selectedRegion,
    detectedAutomatically = true
  ) {

    const container =
      document.getElementById(
        "pricingLocation"
      );


    if (!container) {

      return;

    }


    const options =
      pricingData.regions
        .map(
          region => {

            const selected =
              region.country_code ===
              selectedRegion.country_code
                ? "selected"
                : "";


            return `

              <option
                value="${escapeHtml(
                  region.country_code
                )}"
                ${selected}
              >

                ${escapeHtml(
                  region.country_name
                )}
                (${escapeHtml(
                  region.currency_code
                )})

              </option>

            `;

          }
        )
        .join("");


    container.innerHTML = `

      <span>
        Prices shown for:
      </span>

      <select
        id="pricingCountrySelector"
        aria-label="Select pricing country"
      >

        ${options}

      </select>

      ${
        detectedAutomatically
          ? `
            <span class="pricing-auto-label">
              Auto detected
            </span>
          `
          : ""
      }

    `;



    const selector =
      document.getElementById(
        "pricingCountrySelector"
      );


    selector?.addEventListener(
      "change",
      event => {

        const countryCode =
          event.target.value;


        saveManualCountry(
          countryCode
        );


        const region =
          findRegion(
            countryCode
          );


        activeRegion =
          region;


        renderPrices(
          region
        );


        renderLocationControl(
          region,
          false
        );

      }
    );

  }



  // =====================================================
  // ESCAPE HTML
  // =====================================================

  function escapeHtml(
    value
  ) {

    return String(
      value ??
      ""
    ).replace(

      /[&<>"']/g,

      character => ({

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#039;"

      })[character]

    );

  }



  // =====================================================
  // ERROR / FALLBACK DISPLAY
  // =====================================================

  function renderFallbackLocation() {

    const container =
      document.getElementById(
        "pricingLocation"
      );


    if (!container) {

      return;

    }


    container.innerHTML = `

      Prices shown in
      <strong>
        USD
      </strong>

    `;

  }



  // =====================================================
  // INITIALIZE
  // =====================================================

  async function initializePricing() {

    const locationElement =
      document.getElementById(
        "pricingLocation"
      );


    if (locationElement) {

      locationElement.innerHTML = `

        Prices shown for:
        <strong>
          Detecting location...
        </strong>

      `;

    }


    try {

      // Load DB first.

      pricingData =
        await loadPricingData();


      if (
        !pricingData.services.length
      ) {

        throw new Error(
          "No active services found."
        );

      }


      if (
        !pricingData.regions.length
      ) {

        throw new Error(
          "No active pricing regions found."
        );

      }



      // Detect visitor.

      const manualCountry =
        getManualCountry();


      const countryCode =
        manualCountry ||
        await detectCountry();



      // Find supported region.

      const region =
        findRegion(
          countryCode
        );


      activeRegion =
        region;



      // Render everything.

      renderPrices(
        region
      );


      renderLocationControl(

        region,

        !manualCountry

      );


      console.log(
        "Doana pricing loaded:",
        {
          detectedCountry:
            countryCode,

          pricingCountry:
            region.country_code,

          currency:
            region.currency_code
        }
      );


    } catch (error) {

      console.error(
        "Regional pricing failed:",
        error
      );


      activeRegion =
        FALLBACK_REGION;


      renderFallbackLocation();


      // Give cards a useful fallback instead of
      // leaving "Loading..." forever.

      document
        .querySelectorAll(
          "[data-service-price]"
        )
        .forEach(
          element => {

            if (
              element.textContent
                ?.toLowerCase()
                .includes(
                  "loading"
                )
            ) {

              element.textContent =
                "Contact for pricing";

            }

          }
        );

    }

  }



  // =====================================================
  // START
  // =====================================================

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initializePricing
    );


  } else {

    initializePricing();

  }


})();