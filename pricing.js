(() => {

  "use strict";


  // =====================================================
  // DOANA DIGITAL
  // PUBLIC COUNTRY PRICING
  // =====================================================


  // =====================================================
  // SUPABASE CONFIG
  // =====================================================

  const PRICING_SUPABASE_URL =
    "https://efbmmxtteekbjayiesft.supabase.co";


  const PRICING_SUPABASE_KEY =
    "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";



  // =====================================================
  // COUNTRY CACHE
  // =====================================================

  const COUNTRY_CACHE_KEY =
    "doanaPricingCountry";


  const COUNTRY_CACHE_TIME_KEY =
    "doanaPricingCountryTime";


  const COUNTRY_CACHE_DURATION =
    24 * 60 * 60 * 1000;



  // =====================================================
  // SAFE STORAGE
  // =====================================================

  function getStoredValue(
    key
  ) {

    try {

      return localStorage.getItem(
        key
      );

    } catch {

      return null;

    }

  }


  function setStoredValue(
    key,
    value
  ) {

    try {

      localStorage.setItem(
        key,
        value
      );

    } catch {

      // Storage unavailable.
      // Pricing should still continue working.

    }

  }



  // =====================================================
  // GET CACHED COUNTRY
  // =====================================================

  function getCachedCountry() {

    const cachedCountry =
      getStoredValue(
        COUNTRY_CACHE_KEY
      );


    const cachedTime =
      Number(
        getStoredValue(
          COUNTRY_CACHE_TIME_KEY
        )
      );


    if (
      !cachedCountry ||
      !cachedTime
    ) {

      return null;

    }


    if (
      Date.now() - cachedTime >
      COUNTRY_CACHE_DURATION
    ) {

      return null;

    }


    try {

      const country =
        JSON.parse(
          cachedCountry
        );


      if (
        !country ||
        !country.code
      ) {

        return null;

      }


      return country;


    } catch {

      return null;

    }

  }



  // =====================================================
  // CACHE COUNTRY
  // =====================================================

  function cacheCountry(
    country
  ) {

    if (
      !country ||
      !country.code
    ) {

      return;

    }


    setStoredValue(

      COUNTRY_CACHE_KEY,

      JSON.stringify(
        country
      )

    );


    setStoredValue(

      COUNTRY_CACHE_TIME_KEY,

      String(
        Date.now()
      )

    );

  }



  // =====================================================
  // COUNTRY DETECTION
  // =====================================================

  async function getVisitorCountry() {

    const cachedCountry =
      getCachedCountry();


    if (cachedCountry) {

      return cachedCountry;

    }


    try {

      const controller =
        new AbortController();


      const timeout =
        window.setTimeout(
          () => {

            controller.abort();

          },
          4000
        );


      const response =
        await fetch(

          "https://ipwho.is/",

          {

            signal:
              controller.signal,

            cache:
              "no-store"

          }

        );


      window.clearTimeout(
        timeout
      );


      if (!response.ok) {

        throw new Error(
          "Country lookup failed."
        );

      }


      const result =
        await response.json();


      if (
        result.success === false ||
        !result.country_code
      ) {

        throw new Error(
          "Country unavailable."
        );

      }


      const country = {

        code:
          String(
            result.country_code
          )
            .toUpperCase()
            .substring(
              0,
              2
            ),

        name:
          String(
            result.country ||
            "Unknown"
          ).substring(
            0,
            100
          )

      };


      cacheCountry(
        country
      );


      return country;


    } catch (error) {

      console.warn(
        "Pricing country detection unavailable:",
        error
      );


      // Safe fallback.

      return {

        code:
          "CA",

        name:
          "Canada"

      };

    }

  }



  // =====================================================
  // SUPABASE GET REQUEST
  // =====================================================

  async function publicPricingGet(
    endpoint
  ) {

    const response =
      await fetch(

        `${PRICING_SUPABASE_URL}/rest/v1/${endpoint}`,

        {

          method:
            "GET",

          headers: {

            apikey:
              PRICING_SUPABASE_KEY,

            Authorization:
              `Bearer ${PRICING_SUPABASE_KEY}`,

            Accept:
              "application/json"

          }

        }

      );


    if (!response.ok) {

      const errorText =
        await response.text();


      throw new Error(
        errorText
      );

    }


    return response.json();

  }



  // =====================================================
  // GET PRICING REGION
  // =====================================================

  async function getPricingRegion(
    countryCode
  ) {

    try {

      const regions =
        await publicPricingGet(

          "pricing_regions?" +

          "select=" +
          "country_code," +
          "country_name," +
          "currency_code," +
          "currency_symbol," +
          "multiplier" +

          `&country_code=eq.${encodeURIComponent(
            countryCode
          )}` +

          "&active=eq.true"

        );


      if (
        Array.isArray(regions) &&
        regions.length > 0
      ) {

        return regions[0];

      }


    } catch (error) {

      console.warn(
        "Country pricing lookup failed:",
        error
      );

    }


    return null;

  }



  // =====================================================
  // CANADA FALLBACK REGION
  // =====================================================

  async function getCanadianFallback() {

    try {

      const regions =
        await publicPricingGet(

          "pricing_regions?" +

          "select=" +
          "country_code," +
          "country_name," +
          "currency_code," +
          "currency_symbol," +
          "multiplier" +

          "&country_code=eq.CA" +

          "&active=eq.true"

        );


      if (
        Array.isArray(regions) &&
        regions.length > 0
      ) {

        return regions[0];

      }


    } catch (error) {

      console.warn(
        "Canadian fallback pricing unavailable:",
        error
      );

    }


    // Last-resort fallback.

    return {

      country_code:
        "CA",

      country_name:
        "Canada",

      currency_code:
        "CAD",

      currency_symbol:
        "$",

      multiplier:
        1

    };

  }



  // =====================================================
  // LOAD PRICING DATA
  // =====================================================

  async function loadPricingData() {

    const detectedCountry =
      await getVisitorCountry();


    let region =
      await getPricingRegion(
        detectedCountry.code
      );


    let usingFallback =
      false;


    if (!region) {

      region =
        await getCanadianFallback();


      usingFallback =
        true;

    }



    // =================================================
    // SERVICE PRICES
    // =================================================

    const services =
      await publicPricingGet(

        "services_pricing?" +

        "select=" +
        "service_code," +
        "service_name," +
        "base_price_cad," +
        "price_type" +

        "&active=eq.true" +

        "&order=id.asc"

      );



    // =================================================
    // COUNTRY-SPECIFIC OVERRIDES
    // =================================================

    let overrides =
      [];


    // Only load country-specific override if that country
    // actually has configured pricing.

    if (!usingFallback) {

      try {

        overrides =
          await publicPricingGet(

            "pricing_overrides?" +

            "select=" +
            "service_code," +
            "country_code," +
            "local_price" +

            `&country_code=eq.${encodeURIComponent(
              detectedCountry.code
            )}`

          );


      } catch (error) {

        console.warn(
          "Pricing overrides unavailable:",
          error
        );

        overrides =
          [];

      }

    }



    return {

      detectedCountry,

      region,

      services:
        Array.isArray(services)
          ? services
          : [],

      overrides:
        Array.isArray(overrides)
          ? overrides
          : [],

      usingFallback

    };

  }



  // =====================================================
  // FORMAT PRICE
  // =====================================================

  function formatPrice(
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

          currencyDisplay:
            "symbol",

          maximumFractionDigits:

            amount >= 100
              ? 0
              : 2

        }

      ).format(
        amount
      );


    } catch {

      return (

        `${currencyCode} ` +

        Number(
          amount
        ).toFixed(
          2
        )

      );

    }

  }



  // =====================================================
  // SMART PRICE ROUNDING
  // =====================================================

  function smartRound(
    amount,
    currency
  ) {

    // INR prices look cleaner rounded
    // to the nearest hundred.

    if (
      currency ===
      "INR"
    ) {

      return Math.round(
        amount / 100
      ) * 100;

    }


    // Larger prices don't need cents.

    if (
      amount >= 100
    ) {

      return Math.round(
        amount
      );

    }


    return Math.round(
      amount * 100
    ) / 100;

  }



  // =====================================================
  // CALCULATE SERVICE PRICE
  // =====================================================

  function calculateServicePrice(

    service,

    region,

    overrides,

    detectedCountry,

    usingFallback

  ) {


    // ---------------------------------------------
    // CONTACT ONLY
    // ---------------------------------------------

    if (
      service.price_type ===
      "contact"
    ) {

      return {

        text:
          "Contact for pricing",

        amount:
          null

      };

    }



    // ---------------------------------------------
    // COUNTRY OVERRIDE
    // ---------------------------------------------

    let override =
      null;


    if (!usingFallback) {

      override =
        overrides.find(

          item =>

            item.service_code ===
              service.service_code

            &&

            item.country_code ===
              detectedCountry.code

        ) || null;

    }



    // ---------------------------------------------
    // CALCULATE
    // ---------------------------------------------

    let amount;


    if (override) {

      amount =
        Number(
          override.local_price
        );


    } else {

      amount =

        Number(
          service.base_price_cad
        )

        *

        Number(
          region.multiplier
        );

    }



    // ---------------------------------------------
    // VALIDATE
    // ---------------------------------------------

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {

      return {

        text:
          "Contact for pricing",

        amount:
          null

      };

    }



    amount =
      smartRound(

        amount,

        region.currency_code

      );



    const formatted =
      formatPrice(

        amount,

        region.currency_code

      );



    // ---------------------------------------------
    // PRICE TYPE
    // ---------------------------------------------

    if (
      service.price_type ===
      "starting_at"
    ) {

      return {

        amount,

        text:
          `Starting at ${formatted}`

      };

    }



    return {

      amount,

      text:
        formatted

    };

  }



  // =====================================================
  // COUNTRY DISPLAY LABEL
  // =====================================================

  function getPricingLocationText(

    detectedCountry,

    region,

    usingFallback

  ) {


    // Visitor's country has configured pricing.

    if (!usingFallback) {

      return (

        `${detectedCountry.name}` +
        ` • ` +
        `${region.currency_code}`

      );

    }



    // Country unsupported:
    // tell the visitor clearly that CAD is being shown.

    return (

      `${detectedCountry.name}` +
      ` • Prices shown in CAD`

    );

  }



  // =====================================================
  // RENDER PUBLIC PRICES
  // =====================================================

  async function renderPrices() {

    const priceElements =
      document.querySelectorAll(
        "[data-service-price]"
      );


    const locationElements =
      document.querySelectorAll(
        "[data-pricing-country]"
      );


    if (
      !priceElements.length &&
      !locationElements.length
    ) {

      return;

    }



    // Initial loading state.

    priceElements.forEach(
      element => {

        element.textContent =
          "Loading price...";

      }
    );



    try {

      const {

        detectedCountry,

        region,

        services,

        overrides,

        usingFallback

      } =
        await loadPricingData();



      // =============================================
      // COUNTRY INDICATOR
      // =============================================

      const locationText =
        getPricingLocationText(

          detectedCountry,

          region,

          usingFallback

        );


      locationElements.forEach(
        element => {

          element.textContent =
            locationText;

        }
      );



      // =============================================
      // SERVICE PRICES
      // =============================================

      priceElements.forEach(
        element => {

          const serviceCode =
            element.dataset
              .servicePrice;


          if (!serviceCode) {

            element.textContent =
              "Contact for pricing";

            return;

          }



          const service =
            services.find(

              item =>
                item.service_code ===
                serviceCode

            );



          if (!service) {

            console.warn(
              `Pricing service not found: ${serviceCode}`
            );


            element.textContent =
              "Contact for pricing";

            return;

          }



          const display =
            calculateServicePrice(

              service,

              region,

              overrides,

              detectedCountry,

              usingFallback

            );



          element.textContent =
            display.text;


          element.dataset.currency =
            region.currency_code;


          element.dataset.country =
            usingFallback
              ? region.country_code
              : detectedCountry.code;

        }
      );


    } catch (error) {

      console.error(
        "Unable to load website pricing:",
        error
      );


      priceElements.forEach(
        element => {

          element.textContent =
            "Contact for pricing";

        }
      );


      locationElements.forEach(
        element => {

          element.textContent =
            "Pricing available on request";

        }
      );

    }

  }



  // =====================================================
  // START
  // =====================================================

  renderPrices();


})();