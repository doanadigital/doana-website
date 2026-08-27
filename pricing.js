(() => {

  "use strict";


  // =====================================================
  // DOANA DIGITAL
  // REGIONAL PRICING
  //
  // Supports:
  // - data-pricing-country
  // - #pricingLocation
  // - data-service-price="service-code"
  // - data-service-code="service-code"
  //
  // Pricing priority:
  //
  // 1. Exact country override
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
  // STORAGE
  // =====================================================

  const COUNTRY_CACHE_KEY =
    "doanaPricingCountryV2";


  const COUNTRY_CACHE_TIME_KEY =
    "doanaPricingCountryTimeV2";


  const MANUAL_COUNTRY_KEY =
    "doanaManualPricingCountry";


  const COUNTRY_CACHE_DURATION =
    24 *
    60 *
    60 *
    1000;



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

  let services =
    [];


  let regions =
    [];


  let overrides =
    [];



  // =====================================================
  // DEBUG
  // =====================================================

  console.log(
    "Doana pricing.js loaded"
  );



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

      const errorText =
        await response.text();


      throw new Error(
        `Supabase ${response.status}: ${errorText}`
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


    const timeoutId =
      window.setTimeout(
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

      window.clearTimeout(
        timeoutId
      );

    }

  }



  // =====================================================
  // STORAGE HELPERS
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

      localStorage.setItem(
        MANUAL_COUNTRY_KEY,
        countryCode
      );

    } catch {

      // Storage unavailable.

    }

  }



  function getCachedCountry() {

    try {

      const countryCode =
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
        !countryCode ||
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


      return countryCode;

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
  // COUNTRY DETECTION
  // =====================================================

  async function detectCountry() {

    const manualCountry =
      getManualCountry();


    if (manualCountry) {

      console.log(
        "Using manually selected country:",
        manualCountry
      );


      return manualCountry;

    }



    const cachedCountry =
      getCachedCountry();


    if (cachedCountry) {

      console.log(
        "Using cached country:",
        cachedCountry
      );


      return cachedCountry;

    }



    // =================================================
    // FIRST PROVIDER
    // =================================================

    try {

      const response =
        await fetchWithTimeout(
          "https://ipwho.is/",
          4000
        );


      if (!response.ok) {

        throw new Error(
          "ipwho.is request failed"
        );

      }


      const result =
        await response.json();


      if (
        result.success === true &&
        result.country_code
      ) {

        const countryCode =
          String(
            result.country_code
          )
            .trim()
            .toUpperCase();


        cacheCountry(
          countryCode
        );


        console.log(
          "Detected country through ipwho.is:",
          countryCode
        );


        return countryCode;

      }


    } catch (error) {

      console.warn(
        "Primary country lookup failed:",
        error
      );

    }



    // =================================================
    // SECOND PROVIDER
    // =================================================

    try {

      const response =
        await fetchWithTimeout(
          "https://ipapi.co/json/",
          4000
        );


      if (!response.ok) {

        throw new Error(
          "ipapi.co request failed"
        );

      }


      const result =
        await response.json();


      if (
        result.country_code
      ) {

        const countryCode =
          String(
            result.country_code
          )
            .trim()
            .toUpperCase();


        cacheCountry(
          countryCode
        );


        console.log(
          "Detected country through ipapi.co:",
          countryCode
        );


        return countryCode;

      }


    } catch (error) {

      console.warn(
        "Secondary country lookup failed:",
        error
      );

    }



    console.warn(
      "Country detection unavailable. Falling back to USD."
    );


    return "US";

  }



  // =====================================================
  // LOAD DATABASE DATA
  // =====================================================

  async function loadDatabasePricing() {

    const results =
      await Promise.all([


        // SERVICES

        supabaseGet(

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



        // REGIONS

        supabaseGet(

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



        // OVERRIDES

        supabaseGet(

          "pricing_overrides" +

          "?select=" +

          "service_code," +
          "country_code," +
          "local_price"

        )


      ]);


    services =
      Array.isArray(
        results[0]
      )
        ? results[0]
        : [];


    regions =
      Array.isArray(
        results[1]
      )
        ? results[1]
        : [];


    overrides =
      Array.isArray(
        results[2]
      )
        ? results[2]
        : [];


    console.log(
      "Pricing database loaded:",
      {

        services:
          services.length,

        regions:
          regions.length,

        overrides:
          overrides.length

      }
    );

  }



  // =====================================================
  // FIND REGION
  // =====================================================

  function findRegion(
    countryCode
  ) {

    const matchingRegion =
      regions.find(
        region =>
          region.country_code ===
          countryCode
      );


    if (matchingRegion) {

      return matchingRegion;

    }


    const usRegion =
      regions.find(
        region =>
          region.country_code ===
          "US"
      );


    return usRegion ||
      FALLBACK_REGION;

  }



  // =====================================================
  // FIND OVERRIDE
  // =====================================================

  function findOverride(
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
      findOverride(

        service.service_code,

        region.country_code

      );


    // =================================================
    // EXACT COUNTRY PRICE
    // =================================================

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



    // =================================================
    // CALCULATED PRICE
    // =================================================

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
      Number.isFinite(
        basePrice
      )
      &&
      Number.isFinite(
        exchangeRate
      )
      &&
      Number.isFinite(
        marketMultiplier
      )
    ) {

      return {

        amount:
          basePrice *
          exchangeRate *
          marketMultiplier,

        source:
          "calculated"

      };

    }



    // =================================================
    // USD FALLBACK
    // =================================================

    return {

      amount:
        Number.isFinite(
          basePrice
        )
          ? basePrice
          : 0,

      source:
        "fallback"

    };

  }



  // =====================================================
  // ROUND PRICES
  // =====================================================

  function roundPrice(
    amount,
    currency,
    source
  ) {

    // Do not modify manual overrides.

    if (
      source ===
      "override"
    ) {

      return amount;

    }


    if (
      currency ===
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
      currency ===
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
  // FORMAT CURRENCY
  // =====================================================

  function formatCurrency(
    amount,
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
        amount
      );


    } catch {

      return `${currency} ${amount}`;

    }

  }



  // =====================================================
  // CREATE PRICE TEXT
  // =====================================================

  function getPriceText(
    service,
    region
  ) {

    if (
      service.price_type ===
      "contact"
    ) {

      return "Contact for pricing";

    }


    const price =
      calculatePrice(
        service,
        region
      );


    const rounded =
      roundPrice(

        price.amount,

        region.currency_code,

        price.source

      );


    if (
      rounded <= 0
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
  // UPDATE PRICE ELEMENTS
  // =====================================================

  function renderPrices(
    region
  ) {

    // =================================================
    // EXISTING HTML STYLE
    //
    // <span data-service-price="logo-branding">
    // =================================================

    document
      .querySelectorAll(
        "[data-service-price]"
      )
      .forEach(
        priceElement => {

          let serviceCode =
            priceElement.dataset.servicePrice;


          // Newer markup may have empty data-service-price
          // and service code on parent.

          if (!serviceCode) {

            const parent =
              priceElement.closest(
                "[data-service-code]"
              );


            serviceCode =
              parent?.dataset.serviceCode;

          }


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

            console.warn(
              "Service price not found:",
              serviceCode
            );


            priceElement.textContent =
              "Contact for pricing";


            return;

          }


          priceElement.textContent =
            getPriceText(
              service,
              region
            );


          priceElement.dataset.currency =
            region.currency_code;

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
  // LOCATION DISPLAY
  // =====================================================

  function renderLocation(
    region
  ) {

    // =================================================
    // OLD HTML STYLE
    //
    // <strong data-pricing-country>
    // =================================================

    const oldCountryElements =
      document.querySelectorAll(
        "[data-pricing-country]"
      );


    oldCountryElements
      .forEach(
        element => {

          element.textContent =

            `${region.country_name} • ${region.currency_code}`;

        }
      );



    // =================================================
    // NEW HTML STYLE
    //
    // <div id="pricingLocation">
    // =================================================

    const locationContainer =
      document.getElementById(
        "pricingLocation"
      );


    if (!locationContainer) {

      return;

    }



    const regionOptions =
      regions
        .map(
          item => {

            const selected =
              item.country_code ===
              region.country_code

                ? "selected"

                : "";


            return `

              <option
                value="${escapeHtml(
                  item.country_code
                )}"
                ${selected}
              >

                ${escapeHtml(
                  item.country_name
                )}
                —
                ${escapeHtml(
                  item.currency_code
                )}

              </option>

            `;

          }
        )
        .join("");



    locationContainer.innerHTML = `

      <span>
        Prices shown for:
      </span>


      <strong>

        ${escapeHtml(
          region.country_name
        )}

      </strong>


      <span>
        •
        ${escapeHtml(
          region.currency_code
        )}
      </span>


      <select
        id="pricingCountrySelector"
        aria-label="Change pricing country"
      >

        ${regionOptions}

      </select>

    `;



    const selector =
      document.getElementById(
        "pricingCountrySelector"
      );


    selector
      ?.addEventListener(
        "change",
        event => {

          const selectedCountry =
            event.target.value;


          saveManualCountry(
            selectedCountry
          );


          const selectedRegion =
            findRegion(
              selectedCountry
            );


          renderPrices(
            selectedRegion
          );


          renderLocation(
            selectedRegion
          );

        }
      );

  }



  // =====================================================
  // OLD LOCATION ELEMENT FALLBACK
  // =====================================================

  function renderOldLocationFallback() {

    document
      .querySelectorAll(
        "[data-pricing-country]"
      )
      .forEach(
        element => {

          element.textContent =
            "United States • USD";

        }
      );


    const locationContainer =
      document.getElementById(
        "pricingLocation"
      );


    if (locationContainer) {

      locationContainer.innerHTML = `

        Prices shown in
        <strong>
          USD
        </strong>

      `;

    }

  }



  // =====================================================
  // PRICE FALLBACK
  // =====================================================

  function renderPriceFallback() {

    document
      .querySelectorAll(
        "[data-service-price]"
      )
      .forEach(
        element => {

          if (
            !element.textContent ||
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

    console.log(
      "Starting Doana regional pricing..."
    );


    try {

      // =================================================
      // DATABASE
      // =================================================

      await loadDatabasePricing();


      if (
        services.length ===
        0
      ) {

        throw new Error(
          "No active service prices were returned."
        );

      }


      if (
        regions.length ===
        0
      ) {

        throw new Error(
          "No active pricing regions were returned."
        );

      }



      // =================================================
      // LOCATION
      // =================================================

      const countryCode =
        await detectCountry();


      console.log(
        "Visitor country:",
        countryCode
      );


      const region =
        findRegion(
          countryCode
        );


      console.log(
        "Pricing region:",
        region
      );



      // =================================================
      // DISPLAY
      // =================================================

      renderPrices(
        region
      );


      renderLocation(
        region
      );


    } catch (error) {

      console.error(
        "Doana regional pricing error:",
        error
      );


      renderOldLocationFallback();


      renderPriceFallback();

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