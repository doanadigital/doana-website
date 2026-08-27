(() => {

  "use strict";


  // =====================================================
  // DOANA DIGITAL
  // SECURE PUBLIC FORMS
  //
  // Handles:
  // - Contact form submission
  // - Feedback form submission
  // - Cloudflare Turnstile token
  // - Supabase Edge Function request
  // =====================================================



  // =====================================================
  // SUPABASE PUBLIC CONFIG
  // =====================================================

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";


  const SECURE_FORM_ENDPOINT =
    "https://efbmmxtteekbjayiesft.supabase.co/functions/v1/submit-public-form";



  // =====================================================
  // GET TURNSTILE TOKEN
  // =====================================================

  function getTurnstileToken(
    form
  ) {

    const tokenInput =
      form.querySelector(
        'input[name="cf-turnstile-response"]'
      );


    return (
      tokenInput
        ?.value
        ?.trim()
      ||
      ""
    );

  }



  // =====================================================
  // RESET TURNSTILE
  // =====================================================

  function resetTurnstile() {

    try {

      if (
        window.turnstile &&
        typeof window.turnstile.reset ===
          "function"
      ) {

        window.turnstile.reset();

      }

    } catch (error) {

      console.warn(
        "Unable to reset Turnstile:",
        error
      );

    }

  }



  // =====================================================
  // STATUS MESSAGE
  // =====================================================

  function showStatus(
    element,
    message
  ) {

    if (!element) {

      return;

    }


    element.style.display =
      "block";


    element.textContent =
      message;

  }



  // =====================================================
  // CLEAR STATUS
  // =====================================================

  function clearStatus(
    element
  ) {

    if (!element) {

      return;

    }


    element.style.display =
      "none";


    element.textContent =
      "";

  }



  // =====================================================
  // SECURE EDGE FUNCTION REQUEST
  // =====================================================

  async function submitSecureForm(
    payload
  ) {

    const response =
      await fetch(

        SECURE_FORM_ENDPOINT,

        {

          method:
            "POST",

          headers: {

            apikey:
              SUPABASE_PUBLISHABLE_KEY,

            "Content-Type":
              "application/json",

            Accept:
              "application/json"

          },

          body:
            JSON.stringify(
              payload
            )

        }

      );


    let result;


    try {

      result =
        await response.json();

    } catch {

      result = {

        success:
          false,

        message:
          `Unexpected server response (${response.status}).`

      };

    }



    if (
      !response.ok ||
      result.success !== true
    ) {

      throw new Error(

        result.message ||

        `Unable to submit the form (${response.status}).`

      );

    }


    return result;

  }



  // =====================================================
  // CONTACT FORM
  // =====================================================

  const contactForm =
    document.getElementById(
      "contactForm"
    );


  if (contactForm) {

    contactForm.addEventListener(

      "submit",

      async event => {


        event.preventDefault();



        // =================================================
        // ELEMENTS
        // =================================================

        const statusElement =
          document.getElementById(
            "success"
          );


        const submitButton =
          contactForm.querySelector(
            'button[type="submit"]'
          );


        const formData =
          new FormData(
            contactForm
          );



        // =================================================
        // TURNSTILE
        // =================================================

        const turnstileToken =
          getTurnstileToken(
            contactForm
          );


        if (!turnstileToken) {

          showStatus(

            statusElement,

            "Please complete the security verification."

          );


          return;

        }



        // =================================================
        // PAYLOAD
        // =================================================

        const payload = {

          formType:
            "contact",

          turnstileToken,


          name:
            String(
              formData.get(
                "name"
              )
              ||
              ""
            )
              .trim(),


          email:
            String(
              formData.get(
                "email"
              )
              ||
              ""
            )
              .trim(),


          phone:
            String(
              formData.get(
                "phone"
              )
              ||
              ""
            )
              .trim(),


          business:
            String(
              formData.get(
                "business"
              )
              ||
              ""
            )
              .trim(),


          service:
            String(
              formData.get(
                "service"
              )
              ||
              ""
            )
              .trim(),


          budget:
            String(
              formData.get(
                "budget"
              )
              ||
              ""
            )
              .trim(),


          timeline:
            String(
              formData.get(
                "timeline"
              )
              ||
              ""
            )
              .trim(),


          message:
            String(
              formData.get(
                "message"
              )
              ||
              ""
            )
              .trim()

        };



        // =================================================
        // BASIC CLIENT VALIDATION
        // =================================================

        if (
          !payload.name ||
          !payload.email ||
          !payload.service ||
          payload.message.length < 10
        ) {

          showStatus(

            statusElement,

            "Please complete all required fields."

          );


          return;

        }



        // =================================================
        // SUBMIT STATE
        // =================================================

        if (submitButton) {

          submitButton.disabled =
            true;


          submitButton.textContent =
            "Sending...";

        }


        clearStatus(
          statusElement
        );



        // =================================================
        // SUBMIT
        // =================================================

        try {

          const result =
            await submitSecureForm(
              payload
            );


          contactForm.reset();


          resetTurnstile();


          showStatus(

            statusElement,

            result.message
            ||
            "Thank you! Your inquiry has been sent."

          );


        } catch (error) {

          console.error(
            "Contact form error:",
            error
          );


          resetTurnstile();


          showStatus(

            statusElement,

            error.message
            ||
            "Unable to submit your inquiry. Please try again."

          );


        } finally {

          if (submitButton) {

            submitButton.disabled =
              false;


            submitButton.textContent =
              "Send Inquiry";

          }

        }

      }

    );

  }



  // =====================================================
  // FEEDBACK FORM
  // =====================================================

  const feedbackForm =
    document.getElementById(
      "feedbackForm"
    );


  if (feedbackForm) {

    feedbackForm.addEventListener(

      "submit",

      async event => {


        event.preventDefault();



        // =================================================
        // ELEMENTS
        // =================================================

        const statusElement =
          document.getElementById(
            "feedbackSuccess"
          );


        const submitButton =
          feedbackForm.querySelector(
            'button[type="submit"]'
          );


        const formData =
          new FormData(
            feedbackForm
          );



        // =================================================
        // TURNSTILE
        // =================================================

        const turnstileToken =
          getTurnstileToken(
            feedbackForm
          );


        if (!turnstileToken) {

          showStatus(

            statusElement,

            "Please complete the security verification."

          );


          return;

        }



        // =================================================
        // PAYLOAD
        // =================================================

        const payload = {

          formType:
            "review",

          turnstileToken,


          name:
            String(
              formData.get(
                "clientName"
              )
              ||
              ""
            )
              .trim(),


          business:
            String(
              formData.get(
                "clientBusiness"
              )
              ||
              ""
            )
              .trim(),


          rating:
            Number(
              formData.get(
                "rating"
              )
            ),


          text:
            String(
              formData.get(
                "feedbackText"
              )
              ||
              ""
            )
              .trim()

        };



        // =================================================
        // BASIC VALIDATION
        // =================================================

        if (
          !payload.name ||
          !Number.isInteger(
            payload.rating
          ) ||
          payload.rating < 1 ||
          payload.rating > 5 ||
          payload.text.length < 10
        ) {

          showStatus(

            statusElement,

            "Please complete all required fields."

          );


          return;

        }



        // =================================================
        // SUBMIT STATE
        // =================================================

        if (submitButton) {

          submitButton.disabled =
            true;


          submitButton.textContent =
            "Submitting...";

        }


        clearStatus(
          statusElement
        );



        // =================================================
        // SUBMIT
        // =================================================

        try {

          const result =
            await submitSecureForm(
              payload
            );


          feedbackForm.reset();


          resetTurnstile();


          showStatus(

            statusElement,

            result.message
            ||
            "Thank you! Your feedback has been submitted for review."

          );


        } catch (error) {

          console.error(
            "Feedback form error:",
            error
          );


          resetTurnstile();


          showStatus(

            statusElement,

            error.message
            ||
            "Unable to submit feedback. Please try again."

          );


        } finally {

          if (submitButton) {

            submitButton.disabled =
              false;


            submitButton.textContent =
              "Submit feedback";

          }

        }

      }

    );

  }


})();