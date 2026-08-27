(() => {

  "use strict";


  // =====================================================
  // DOANA DIGITAL
  // AUTOMATIC REGIONAL PRICING
  //
  // Visitor sees only their localized price.
  //
  // Priority:
  // 1. Country-specific override
  // 2. USD base × exchange rate × market multiplier
  // 3. USD fallback
  // =====================================================


  // =====================================================
  // SUPABASE
  // =====================================================

  const SUPABASE_URL =
    "https://efbmmxtteekbjayiesft.supabase.co";


  const SUPABASE_KEY =
    "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";


  // =====================================================
  // CACHE
  // =====================================================

  const COUNTRY_CACHE_KEY =
    "doanaPricingCountryV3";


  const COUNTRY_CACHE_TIME_KEY =
    "doanaPricingCountryTimeV3";


  const CACHE_DURATION =
    24 *
    60 *
    60 *
    1000;


  // =====================================================
  // FALLBACK REGION
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
      1

  };


  // =====================================================
  // STATE
  // =====================================================

  let services =
    [];


  let regions =
    [];


  let overrides =
    [];


  // =====================================================
  // SUPABASE GET
  // =====================================================

  async function supabaseGet(
    endpoint
  ) {

    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/${endpoint}`,

        {

          method:
            "GET",

          headers: {

            apikey:
              SUPABASE_KEY,

            Accept:
              "application/json"

          }

        }

      );


    if (!response.ok) {

      const error =
        await response.text();


      throw new Error(
        `Supabase error ${response.status}: ${error}`
      );

    }


    return await response.json();

  }


  // =====================================================
  // FETCH WITH TIMEOUT
  // =====================================================

  async function fetchWithTimeout(
    url,
    timeout = 4000
  ) {

    const controller =
      new AbortController();


    const timer =
      setTimeout(
        () => {

          controller.abort();

        },
        timeout
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

      clearTimeout(
        timer
      );

    }

  }


  // =====================================================
  // CACHE HELPERS
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
        CACHE_DURATION
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

      // Ignore storage issues.

    }

  }


  // =====================================================
  // DETECT COUNTRY
  // =====================================================

  async function detectCountry() {

    const cached =
      getCachedCountry();


    if (cached) {

      return cached;

    }


    // =================================================
    // PRIMARY PROVIDER
    // =================================================

    try {

      const response =
        await fetchWithTimeout(

          "https://ipwho.is/",

          4000

        );


      if (!response.ok) {

        throw new Error(
          "Primary location provider failed."
        );

      }


      const data =
        await response.json();


      if (
        data.success ===
          true
        &&
        data.country_code
      ) {

        const countryCode =
          String(
            data.country_code
          )
            .trim()
            .toUpperCase();


        cacheCountry(
          countryCode
        );


        return countryCode;

      }


    } catch (error) {

      console.warn(
        "Primary country detection failed:",
        error
      );

    }


    // =================================================
    // FALLBACK PROVIDER
    // =================================================

    try {

      const response =
        await fetchWithTimeout(

          "https://ipapi.co/json/",

          4000

        );


      if (!response.ok) {

        throw new Error(
          "Secondary location provider failed."
        );

      }


      const data =
        await response.json();


      if (
        data.country_code
      ) {

        const countryCode =
          String(
            data.country_code
          )
            .trim()
            .toUpperCase();


        cacheCountry(
          countryCode
        );


        return countryCode;

      }


    } catch (error) {

      console.warn(
        "Secondary country detection failed:",
        error
      );

    }


    // =================================================
    // FINAL FALLBACK
    // =================================================

    return "US";

  }


  // =====================================================
  // LOAD PRICING DATA
  // =====================================================

  async function loadPricingData() {

    const [
      serviceData,
      regionData,
      overrideData
    ] =
      await Promise.all([


        supabaseGet(

          "services_pricing?" +

          "select=" +

          "service_code," +
          "service_name," +
          "base_price_usd," +
          "price_type," +
          "active" +

          "&active=eq.true"

        ),


        supabaseGet(

          "pricing_regions?" +

          "select=" +

          "country_code," +
          "country_name," +
          "currency_code," +
          "currency_symbol," +
          "exchange_rate," +
          "market_multiplier," +
          "active" +

          "&active=eq.true"

        ),


        supabaseGet(

          "pricing_overrides?" +

          "select=" +

          "service_code," +
          "country_code," +
          "local_price"

        )


      ]);


    services =
      Array.isArray(
        serviceData
      )
        ? serviceData
        : [];


    regions =
      Array.isArray(
        regionData
      )
        ? regionData
        : [];


    overrides =
      Array.isArray(
        overrideData
      )
        ? overrideData
        : [];

  }


  // =====================================================
  // FIND REGION
  // =====================================================

  function getRegion(
    countryCode
  ) {

    const exact =
      regions.find(
        region =>
          region.country_code ===
          countryCode
      );


    if (exact) {

      return exact;

    }


    const usd =
      regions.find(
        region =>
          region.country_code ===
          "US"
      );


    return usd ||
      FALLBACK_REGION;

  }


  // =====================================================
  // FIND COUNTRY OVERRIDE
  // =====================================================

  function getOverride(
    serviceCode,
    countryCode
  ) {

    return overrides.find(

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
      getOverride(

        service.service_code,

        region.country_code

      );


    if (
      override
      &&
      Number.isFinite(

        Number(
          override.local_price
        )

      )
    ) {

      return {

        value:
          Number(
            override.local_price
          ),

        override:
          true

      };

    }


    const basePrice =
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
      !Number.isFinite(
        basePrice
      )
      ||
      !Number.isFinite(
        exchangeRate
      )
      ||
      !Number.isFinite(
        marketMultiplier
      )
    ) {

      return {

        value:
          basePrice ||
          0,

        override:
          false

      };

    }


    return {

      value:
        basePrice *
        exchangeRate *
        marketMultiplier,

      override:
        false

    };

  }


  // =====================================================
  // COMMERCIAL ROUNDING
  // =====================================================

  function roundPrice(
    value,
    currency,
    isOverride
  ) {

    // Never change a manually defined price.

    if (isOverride) {

      return value;

    }


    if (
      currency ===
      "INR"
    ) {

      return (
        Math.round(
          value /
          100
        )
        *
        100
      );

    }


    if (
      currency ===
      "AED"
    ) {

      return (
        Math.round(
          value /
          5
        )
        *
        5
      );

    }


    return Math.round(
      value
    );

  }


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  function formatCurrency(
    value,
    currency
  ) {

    try {

      return new Intl.NumberFormat(

        undefined,

        {

          style:
            "currency",

          currency,

          minimumFractionDigits:
            0,

          maximumFractionDigits:
            0

        }

      ).format(
        value
      );


    } catch {

      return `${currency} ${value}`;

    }

  }


  // =====================================================
  // CREATE PRICE LABEL
  // =====================================================

  function buildPriceText(
    service,
    region
  ) {

    if (
      service.price_type ===
      "contact"
    ) {

      return "Contact for pricing";

    }


    const calculated =
      calculatePrice(

        service,

        region

      );


    const rounded =
      roundPrice(

        calculated.value,

        region.currency_code,

        calculated.override

      );


    if (
      !Number.isFinite(
        rounded
      )
      ||
      rounded <=
      0
    ) {

      return "Contact for pricing";

    }


    const formatted =
      formatCurrency(

        rounded,

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
  // RENDER PRICES
  // =====================================================

  function renderPrices(
    region
  ) {

    document
      .querySelectorAll(
        "[data-service-price]"
      )
      .forEach(
        element => {


          const serviceCode =
            element.dataset
              .servicePrice;


          if (!serviceCode) {

            return;

          }


          const service =
            services.find(

              item =>

                item.service_code ===
                serviceCode

            );


          if (!service) {

            element.textContent =
              "Contact for pricing";


            return;

          }


          element.textContent =
            buildPriceText(

              service,

              region

            );


          element.dataset.currency =
            region.currency_code;


          element.dataset.country =
            region.country_code;

        }
      );

  }


  // =====================================================
  // FALLBACK UI
  // =====================================================

  function renderFallback() {

    document
      .querySelectorAll(
        "[data-service-price]"
      )
      .forEach(
        element => {


          if (
            !element.textContent
            ||
            element.textContent
              .toLowerCase()
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


  // =====================================================
  // INITIALIZE
  // =====================================================

  async function initializePricing() {

    try {

      await loadPricingData();


      if (
        !services.length
      ) {

        throw new Error(
          "No active services found."
        );

      }


      if (
        !regions.length
      ) {

        throw new Error(
          "No active pricing regions found."
        );

      }


      const countryCode =
        await detectCountry();


      const region =
        getRegion(
          countryCode
        );


      renderPrices(
        region
      );


      console.log(

        "Doana regional pricing loaded:",

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


      renderFallback();

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