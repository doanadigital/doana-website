(() => {

  "use strict";


  // =====================================================
  // DOANA DIGITAL
  // REGIONAL PRICING
  //
  // Priority:
  //
  // 1. Country override
  // 2. USD base × exchange rate × market multiplier
  // 3. USD fallback
  // =====================================================



  // =====================================================
  // SUPABASE
  // =====================================================

  const SUPABASE_URL =
    "https://efbmmxtteekbjayiesft.supabase.co";


  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";



  // =====================================================
  // COUNTRY CACHE
  // =====================================================

  const COUNTRY_CACHE_KEY =
    "doanaPricingCountry";


  const COUNTRY_CACHE_TIME_KEY =
    "doanaPricingCountryTime";


  const COUNTRY_CACHE_DURATION =
    1000 *
    60 *
    60 *
    24;



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
  // SUPABASE REQUEST
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

            Authorization:
              `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,

            Accept:
              "application/json"

          }

        }

      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );

    }


    return await response.json();

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

      // Ignore unavailable storage.

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


    try {

      const response =
        await fetch(
          "https://ipwho.is/"
        );


      if (!response.ok) {

        throw new Error(
          "Country lookup failed."
        );

      }


      const data =
        await response.json();


      if (
        data.success !== true ||
        !data.country_code
      ) {

        throw new Error(
          "Country unavailable."
        );

      }


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


    } catch (error) {

      console.warn(
        "Country detection unavailable:",
        error
      );


      return "US";

    }

  }



  // =====================================================
  // LOAD PRICING DATA
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
          "&active=eq.true"
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
          "&active=eq.true"
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
    regions,
    countryCode
  ) {

    return (
      regions.find(
        region =>
          region.country_code ===
          countryCode
      )
      ||
      regions.find(
        region =>
          region.country_code ===
          "US"
      )
      ||
      FALLBACK_REGION
    );

  }



  // =====================================================
  // FIND OVERRIDE
  // =====================================================

  function findOverride(
    overrides,
    serviceCode,
    countryCode
  ) {

    return overrides.find(
      override =>
        override.service_code ===
          serviceCode
        &&
        override.country_code ===
          countryCode
    );

  }



  // =====================================================
  // CALCULATE PRICE
  // =====================================================

  function calculatePrice(
    service,
    region,
    overrides
  ) {

    const override =
      findOverride(

        overrides,

        service.service_code,

        region.country_code

      );


    if (
      override &&
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

        type:
          "override"

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
      ) ||
      !Number.isFinite(
        exchangeRate
      ) ||
      !Number.isFinite(
        marketMultiplier
      )
    ) {

      return {

        value:
          basePrice || 0,

        type:
          "fallback"

      };

    }


    return {

      value:
        basePrice *
        exchangeRate *
        marketMultiplier,

      type:
        "calculated"

    };

  }



  // =====================================================
  // SMART ROUNDING
  // =====================================================

  function roundCommercialPrice(
    value,
    currency
  ) {

    if (
      !Number.isFinite(
        value
      )
    ) {

      return 0;

    }


    // INR

    if (
      currency ===
      "INR"
    ) {

      if (
        value >=
        1000
      ) {

        return (
          Math.round(
            value /
            500
          ) *
          500
        );

      }


      return Math.round(
        value /
        100
      ) *
      100;

    }


    // Larger-number currencies

    if (
      currency ===
        "AED"
      ||
      currency ===
        "JPY"
    ) {

      return Math.round(
        value /
        10
      ) *
      10;

    }


    // USD / CAD / GBP / EUR / AUD etc.

    if (
      value >=
      100
    ) {

      return Math.round(
        value
      );

    }


    return Math.round(
      value *
      100
    ) /
    100;

  }



  // =====================================================
  // FORMAT CURRENCY
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

          maximumFractionDigits:
            0

        }

      ).format(
        amount
      );


    } catch {

      return `${currencyCode} ${amount}`;

    }

  }



  // =====================================================
  // PRICE LABEL
  // =====================================================

  function getPriceLabel(
    service,
    price,
    region
  ) {

    if (
      service.price_type ===
      "contact"
    ) {

      return "Contact for pricing";

    }


    const rounded =
      roundCommercialPrice(

        price.value,

        region.currency_code

      );


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
  // UPDATE LOCATION LABEL
  // =====================================================

  function updatePricingLocation(
    region
  ) {

    const element =
      document.getElementById(
        "pricingLocation"
      );


    if (!element) {

      return;

    }


    element.innerHTML = `

      Prices shown for
      <strong>
        ${region.country_name}
      </strong>
      •
      ${region.currency_code}

    `;

  }



  // =====================================================
  // UPDATE SERVICE CARDS
  // =====================================================

  function updateServiceCards(
    services,
    region,
    overrides
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
            services.find(
              item =>
                item.service_code ===
                serviceCode
            );


          if (!service) {

            return;

          }


          const priceElement =
            card.querySelector(
              "[data-service-price]"
            );


          if (!priceElement) {

            return;

          }


          const price =
            calculatePrice(

              service,

              region,

              overrides

            );


          priceElement.textContent =
            getPriceLabel(

              service,

              price,

              region

            );

        }
      );

  }



  // =====================================================
  // INITIALIZE
  // =====================================================

  async function initializePricing() {

    try {

      const countryCode =
        await detectCountry();


      const pricing =
        await loadPricingData();


      const region =
        findRegion(

          pricing.regions,

          countryCode

        );


      updatePricingLocation(
        region
      );


      updateServiceCards(

        pricing.services,

        region,

        pricing.overrides

      );


    } catch (error) {

      console.error(
        "Unable to load regional pricing:",
        error
      );

    }

  }



  // =====================================================
  // START
  // =====================================================

  initializePricing();


})();