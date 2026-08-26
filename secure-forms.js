(() => {

  "use strict";


  // =====================================================
  // DOANA DIGITAL
  // SECURE PUBLIC FORMS
  // =====================================================


  const SECURE_FORM_ENDPOINT =

    "https://efbmmxtteekbjayiesft.supabase.co/functions/v1/submit-public-form";



  // =====================================================
  // HELPERS
  // =====================================================

  function getTurnstileToken(
    form
  ) {

    const tokenInput =
      form.querySelector(
        'input[name="cf-turnstile-response"]'
      );


    return tokenInput
      ?.value
      ?.trim() ||
      "";

  }



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

            "Content-Type":
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
          "Unexpected server response."

      };

    }


    if (
      !response.ok ||
      result.success !==
      true
    ) {

      throw new Error(

        result.message ||

        "Unable to submit the form."

      );

    }


    return result;

  }



  // =====================================================
  // CONTACT
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



        // =============================================
        // TURNSTILE
        // =============================================

        const turnstileToken =
          getTurnstileToken(
            contactForm
          );


        if (!turnstileToken) {

          if (statusElement) {

            statusElement.style.display =
              "block";


            statusElement.textContent =
              "Please complete the security verification.";

          }

          return;

        }



        // =============================================
        // PAYLOAD
        // =============================================

        const payload = {

          formType:
            "contact",

          turnstileToken,

          name:
            String(
              formData.get(
                "name"
              ) || ""
            ).trim(),

          email:
            String(
              formData.get(
                "email"
              ) || ""
            ).trim(),

          phone:
            String(
              formData.get(
                "phone"
              ) || ""
            ).trim(),

          business:
            String(
              formData.get(
                "business"
              ) || ""
            ).trim(),

          service:
            String(
              formData.get(
                "service"
              ) || ""
            ).trim(),

          budget:
            String(
              formData.get(
                "budget"
              ) || ""
            ).trim(),

          timeline:
            String(
              formData.get(
                "timeline"
              ) || ""
            ).trim(),

          message:
            String(
              formData.get(
                "message"
              ) || ""
            ).trim()

        };



        // =============================================
        // BASIC CLIENT VALIDATION
        // =============================================

        if (
          !payload.name ||
          !payload.email ||
          !payload.service ||
          payload.message.length < 10
        ) {

          if (statusElement) {

            statusElement.style.display =
              "block";


            statusElement.textContent =
              "Please complete all required fields.";

          }

          return;

        }



        // =============================================
        // SUBMIT
        // =============================================

        if (submitButton) {

          submitButton.disabled =
            true;


          submitButton.textContent =
            "Sending...";

        }


        if (statusElement) {

          statusElement.style.display =
            "none";


          statusElement.textContent =
            "";

        }


        try {

          const result =
            await submitSecureForm(
              payload
            );


          contactForm.reset();


          resetTurnstile();


          if (statusElement) {

            statusElement.style.display =
              "block";


            statusElement.textContent =

              result.message ||

              "Thank you! Your inquiry has been sent.";

          }


        } catch (error) {

          console.error(
            "Contact form error:",
            error
          );


          resetTurnstile();


          if (statusElement) {

            statusElement.style.display =
              "block";


            statusElement.textContent =

              error.message ||

              "Unable to submit your inquiry. Please try again.";

          }


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
  // FEEDBACK
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



        // =============================================
        // TURNSTILE
        // =============================================

        const turnstileToken =
          getTurnstileToken(
            feedbackForm
          );


        if (!turnstileToken) {

          if (statusElement) {

            statusElement.style.display =
              "block";


            statusElement.textContent =
              "Please complete the security verification.";

          }

          return;

        }



        const payload = {

          formType:
            "review",

          turnstileToken,

          name:
            String(
              formData.get(
                "clientName"
              ) || ""
            ).trim(),

          business:
            String(
              formData.get(
                "clientBusiness"
              ) || ""
            ).trim(),

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
              ) || ""
            ).trim()

        };



        // =============================================
        // BASIC VALIDATION
        // =============================================

        if (
          !payload.name ||
          payload.rating < 1 ||
          payload.rating > 5 ||
          payload.text.length < 10
        ) {

          if (statusElement) {

            statusElement.style.display =
              "block";


            statusElement.textContent =
              "Please complete all required fields.";

          }

          return;

        }



        // =============================================
        // SUBMIT
        // =============================================

        if (submitButton) {

          submitButton.disabled =
            true;


          submitButton.textContent =
            "Submitting...";

        }


        if (statusElement) {

          statusElement.style.display =
            "none";


          statusElement.textContent =
            "";

        }


        try {

          const result =
            await submitSecureForm(
              payload
            );


          feedbackForm.reset();


          resetTurnstile();


          if (statusElement) {

            statusElement.style.display =
              "block";


            statusElement.textContent =

              result.message ||

              "Thank you! Your feedback has been submitted for review.";

          }


        } catch (error) {

          console.error(
            "Feedback form error:",
            error
          );


          resetTurnstile();


          if (statusElement) {

            statusElement.style.display =
              "block";


            statusElement.textContent =

              error.message ||

              "Unable to submit feedback. Please try again.";

          }


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