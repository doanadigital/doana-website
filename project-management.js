(() => {

  "use strict";


  // =====================================================
  // DOANA DIGITAL
  // LEAD + PROJECT MANAGEMENT
  // =====================================================


  const SUPABASE_URL =
    "https://efbmmxtteekbjayiesft.supabase.co";


  const SUPABASE_KEY =
    "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";



  // =====================================================
  // DOM
  // =====================================================

  const managementTab =
    document.getElementById(
      "projectManagementTab"
    );


  const managementPanel =
    document.getElementById(
      "projectManagementPanel"
    );


  const leadsView =
    document.getElementById(
      "pipelineLeadsView"
    );


  const projectsView =
    document.getElementById(
      "pipelineProjectsView"
    );


  const leadList =
    document.getElementById(
      "pipelineLeadList"
    );


  const projectList =
    document.getElementById(
      "pipelineProjectList"
    );


  const message =
    document.getElementById(
      "pipelineMessage"
    );


  const leadSearch =
    document.getElementById(
      "pipelineLeadSearch"
    );


  const leadStageFilter =
    document.getElementById(
      "pipelineLeadStage"
    );


  const projectSearch =
    document.getElementById(
      "pipelineProjectSearch"
    );


  const projectStatusFilter =
    document.getElementById(
      "pipelineProjectStatus"
    );


  const refreshLeads =
    document.getElementById(
      "pipelineRefreshLeads"
    );


  const refreshProjects =
    document.getElementById(
      "pipelineRefreshProjects"
    );


  const pipelineViewButtons =
    document.querySelectorAll(
      ".pipeline-view"
    );



  // =====================================================
  // SUMMARY
  // =====================================================

  const openLeadCount =
    document.getElementById(
      "pipelineOpenLeads"
    );


  const followUpCount =
    document.getElementById(
      "pipelineFollowUps"
    );


  const activeProjectCount =
    document.getElementById(
      "pipelineActiveProjects"
    );


  const completedProjectCount =
    document.getElementById(
      "pipelineCompletedProjects"
    );



  // =====================================================
  // MODAL
  // =====================================================

  const projectModal =
    document.getElementById(
      "projectCreateModal"
    );


  const projectForm =
    document.getElementById(
      "projectCreateForm"
    );


  const projectModalClose =
    document.getElementById(
      "projectModalClose"
    );


  const projectCreateCancel =
    document.getElementById(
      "projectCreateCancel"
    );


  // =====================================================
  // STATE
  // =====================================================

  let leads =
    [];


  let projects =
    [];



  // =====================================================
  // ACCESS TOKEN
  // =====================================================

  function getAccessToken() {

    return sessionStorage.getItem(
      "doanaAdminToken"
    );

  }



  // =====================================================
  // API REQUEST
  // =====================================================

  async function adminRequest(
    endpoint,
    options = {}
  ) {

    const token =
      getAccessToken();


    if (!token) {

      throw new Error(
        "Admin session unavailable."
      );

    }


    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/${endpoint}`,

        {

          ...options,

          headers: {

            apikey:
              SUPABASE_KEY,

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",

            ...(options.headers || {})

          }

        }

      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );

    }


    const responseText =
      await response.text();


    return responseText
      ? JSON.parse(
          responseText
        )
      : null;

  }



  // =====================================================
  // HTML ESCAPE
  // =====================================================

  function escapeHtml(
    value
  ) {

    return String(
      value ?? ""
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
  // MESSAGE
  // =====================================================

  function showMessage(
    text
  ) {

    if (!message) {
      return;
    }


    message.textContent =
      text;


    message.style.display =
      "block";


    window.setTimeout(
      () => {

        message.style.display =
          "none";

      },
      3500
    );

  }



  // =====================================================
  // DATE
  // =====================================================

  function formatDate(
    value
  ) {

    if (!value) {

      return "—";

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "—";

    }


    return date.toLocaleDateString();

  }



  // =====================================================
  // CURRENCY
  // =====================================================

  function formatMoney(
    value,
    currency = "CAD"
  ) {

    const number =
      Number(
        value
      );


    if (
      !Number.isFinite(
        number
      )
    ) {

      return "—";

    }


    try {

      return new Intl.NumberFormat(

        undefined,

        {

          style:
            "currency",

          currency

        }

      ).format(
        number
      );


    } catch {

      return `${currency} ${number}`;

    }

  }



  // =====================================================
  // MAIN PANEL
  // =====================================================

  function showManagementPanel() {

    document
      .querySelectorAll(
        ".admin-main-tab"
      )
      .forEach(
        tab => {

          tab.classList.remove(
            "active"
          );

        }
      );


    managementTab
      ?.classList
      .add(
        "active"
      );


    [
      document.getElementById(
        "analyticsPanel"
      ),

      document.getElementById(
        "inquiriesPanel"
      ),

      document.getElementById(
        "reviewsPanel"
      ),

      document.getElementById(
        "pricingPanel"
      )

    ].forEach(
      panel => {

        if (panel) {

          panel.style.display =
            "none";

        }

      }
    );


    if (managementPanel) {

      managementPanel.style.display =
        "block";

    }


    loadEverything();

  }



  managementTab?.addEventListener(
    "click",
    showManagementPanel
  );



  // =====================================================
  // HIDE PROJECT PANEL WHEN OTHER TAB CLICKED
  // =====================================================

  [
    "analyticsTab",
    "inquiriesTab",
    "reviewsTab",
    "pricingTab"

  ].forEach(
    id => {

      document
        .getElementById(
          id
        )
        ?.addEventListener(
          "click",
          () => {

            if (managementPanel) {

              managementPanel.style.display =
                "none";

            }

          }
        );

    }
  );



  // =====================================================
  // PIPELINE SUB VIEWS
  // =====================================================

  pipelineViewButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          pipelineViewButtons.forEach(
            item => {

              item.classList.remove(
                "active"
              );

            }
          );


          button.classList.add(
            "active"
          );


          const view =
            button.dataset.pipelineView;


          if (
            view ===
            "leads"
          ) {

            leadsView.style.display =
              "block";


            projectsView.style.display =
              "none";


          } else {

            leadsView.style.display =
              "none";


            projectsView.style.display =
              "block";

          }

        }
      );

    }
  );



  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  async function loadEverything() {

    await Promise.allSettled([

      loadLeads(),

      loadProjects()

    ]);


    renderSummary();

  }



  // =====================================================
  // LOAD LEADS
  // =====================================================

  async function loadLeads() {

    if (!leadList) {
      return;
    }


    leadList.innerHTML = `

      <p class="note">
        Loading leads...
      </p>

    `;


    try {

      leads =
        await adminRequest(

          "contact_inquiries?" +

          "select=" +

          "id," +
          "name," +
          "email," +
          "phone," +
          "business," +
          "service," +
          "budget," +
          "timeline," +
          "message," +
          "status," +
          "lead_stage," +
          "priority," +
          "estimated_value," +
          "currency_code," +
          "admin_notes," +
          "follow_up_at," +
          "last_contacted_at," +
          "created_at," +
          "updated_at" +

          "&order=created_at.desc"

        );


      renderLeads();


    } catch (error) {

      console.error(
        "Unable to load leads:",
        error
      );


      leadList.innerHTML = `

        <p class="note">
          Unable to load leads.
        </p>

      `;

    }

  }



  // =====================================================
  // FILTERED LEADS
  // =====================================================

  function getFilteredLeads() {

    const search =
      (
        leadSearch?.value ||
        ""
      )
        .trim()
        .toLowerCase();


    const stage =
      leadStageFilter?.value ||
      "all";


    return leads.filter(
      lead => {

        if (
          stage !==
          "all"
          &&
          lead.lead_stage !==
          stage
        ) {

          return false;

        }


        if (!search) {

          return true;

        }


        const searchText = [

          lead.name,
          lead.email,
          lead.business,
          lead.service

        ]
          .join(" ")
          .toLowerCase();


        return searchText.includes(
          search
        );

      }
    );

  }



  // =====================================================
  // RENDER LEADS
  // =====================================================

  function renderLeads() {

    if (!leadList) {
      return;
    }


    const filtered =
      getFilteredLeads();


    if (!filtered.length) {

      leadList.innerHTML = `

        <p class="note">
          No leads found.
        </p>

      `;

      return;

    }


    leadList.innerHTML =
      filtered
        .map(
          lead => {

            const priority =
              lead.priority ||
              "normal";


            return `

              <article
                class="
                  pipeline-card
                  priority-${escapeHtml(priority)}
                "
              >


                <div class="pipeline-card-header">


                  <div>

                    <span class="pipeline-stage">

                      ${formatStage(
                        lead.lead_stage
                      )}

                    </span>


                    <h3>

                      ${escapeHtml(
                        lead.name
                      )}

                    </h3>


                    <a
                      href="mailto:${escapeHtml(
                        lead.email
                      )}"
                    >

                      ${escapeHtml(
                        lead.email
                      )}

                    </a>

                  </div>



                  <select
                    class="pipeline-stage-select"
                    data-lead-stage="${lead.id}"
                  >

                    ${leadStageOptions(
                      lead.lead_stage
                    )}

                  </select>


                </div>



                <div class="pipeline-details">


                  <div>

                    <strong>
                      Business
                    </strong>

                    <span>

                      ${escapeHtml(
                        lead.business ||
                        "—"
                      )}

                    </span>

                  </div>



                  <div>

                    <strong>
                      Service
                    </strong>

                    <span>

                      ${escapeHtml(
                        lead.service
                      )}

                    </span>

                  </div>



                  <div>

                    <strong>
                      Budget
                    </strong>

                    <span>

                      ${escapeHtml(
                        lead.budget ||
                        "—"
                      )}

                    </span>

                  </div>



                  <div>

                    <strong>
                      Potential Value
                    </strong>

                    <span>

                      ${
                        lead.estimated_value !==
                        null

                          ? formatMoney(
                              lead.estimated_value,
                              lead.currency_code
                            )

                          : "—"
                      }

                    </span>

                  </div>



                  <div>

                    <strong>
                      Follow-up
                    </strong>

                    <span>

                      ${formatDate(
                        lead.follow_up_at
                      )}

                    </span>

                  </div>



                  <div>

                    <strong>
                      Received
                    </strong>

                    <span>

                      ${formatDate(
                        lead.created_at
                      )}

                    </span>

                  </div>


                </div>



                <div class="pipeline-message">

                  <strong>
                    Client Request
                  </strong>


                  <p>

                    ${escapeHtml(
                      lead.message
                    )}

                  </p>

                </div>



                <div class="pipeline-edit-grid">


                  <div>

                    <label>
                      Priority
                    </label>

                    <select
                      data-lead-priority="${lead.id}"
                    >

                      <option
                        value="low"
                        ${
                          priority ===
                          "low"

                            ? "selected"
                            : ""
                        }
                      >
                        Low
                      </option>

                      <option
                        value="normal"
                        ${
                          priority ===
                          "normal"

                            ? "selected"
                            : ""
                        }
                      >
                        Normal
                      </option>

                      <option
                        value="high"
                        ${
                          priority ===
                          "high"

                            ? "selected"
                            : ""
                        }
                      >
                        High
                      </option>

                    </select>

                  </div>



                  <div>

                    <label>
                      Estimated Value
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value="${lead.estimated_value ?? ""}"
                      data-lead-value="${lead.id}"
                    >

                  </div>



                  <div>

                    <label>
                      Currency
                    </label>

                    <input
                      maxlength="3"
                      value="${escapeHtml(
                        lead.currency_code ||
                        "CAD"
                      )}"
                      data-lead-currency="${lead.id}"
                    >

                  </div>



                  <div>

                    <label>
                      Follow-up
                    </label>

                    <input
                      type="datetime-local"
                      value="${dateTimeLocal(
                        lead.follow_up_at
                      )}"
                      data-lead-followup="${lead.id}"
                    >

                  </div>


                </div>



                <label>
                  Internal Notes
                </label>


                <textarea
                  rows="4"
                  maxlength="5000"
                  data-lead-notes="${lead.id}"
                >${escapeHtml(
                  lead.admin_notes ||
                  ""
                )}</textarea>



                <div class="pipeline-actions">


                  <button
                    class="btn"
                    type="button"
                    data-save-lead="${lead.id}"
                  >
                    Save Lead
                  </button>


                  <a
                    class="btn"
                    href="mailto:${escapeHtml(
                      lead.email
                    )}"
                  >
                    Email Client
                  </a>


                  ${
                    lead.lead_stage !==
                    "lost"

                      ? `

                        <button
                          class="btn btn-primary"
                          type="button"
                          data-convert-lead="${lead.id}"
                        >
                          Convert to Project
                        </button>

                      `

                      : ""
                  }


                </div>


              </article>

            `;

          }
        )
        .join("");


    attachLeadEvents();

  }



  // =====================================================
  // LEAD STAGE OPTIONS
  // =====================================================

  function leadStageOptions(
    current
  ) {

    const stages = [

      [
        "new",
        "New"
      ],

      [
        "contacted",
        "Contacted"
      ],

      [
        "qualified",
        "Qualified"
      ],

      [
        "quote_sent",
        "Quote Sent"
      ],

      [
        "accepted",
        "Accepted"
      ],

      [
        "lost",
        "Lost"
      ]

    ];


    return stages
      .map(
        ([value,label]) => `

          <option
            value="${value}"
            ${
              value ===
              current

                ? "selected"
                : ""
            }
          >

            ${label}

          </option>

        `
      )
      .join("");

  }



  // =====================================================
  // FORMAT STAGE
  // =====================================================

  function formatStage(
    stage
  ) {

    const names = {

      new:
        "New",

      contacted:
        "Contacted",

      qualified:
        "Qualified",

      quote_sent:
        "Quote Sent",

      accepted:
        "Accepted",

      lost:
        "Lost"

    };


    return names[stage] ||
      stage;

  }



  // =====================================================
  // DATE TIME LOCAL
  // =====================================================

  function dateTimeLocal(
    value
  ) {

    if (!value) {

      return "";

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "";

    }


    const offset =
      date.getTimezoneOffset();


    const local =
      new Date(
        date.getTime() -
        offset * 60000
      );


    return local
      .toISOString()
      .slice(
        0,
        16
      );

  }



  // =====================================================
  // ATTACH LEAD EVENTS
  // =====================================================

  function attachLeadEvents() {

    document
      .querySelectorAll(
        "[data-lead-stage]"
      )
      .forEach(
        select => {

          select.addEventListener(
            "change",
            () => {

              updateLeadStage(

                select.dataset.leadStage,

                select.value

              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-save-lead]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              saveLead(
                button.dataset.saveLead
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-convert-lead]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              openProjectModal(
                button.dataset.convertLead
              );

            }
          );

        }
      );

  }



  // =====================================================
  // UPDATE LEAD STAGE
  // =====================================================

  async function updateLeadStage(
    id,
    stage
  ) {

    const body = {

      lead_stage:
        stage

    };


    if (
      stage ===
      "contacted"
    ) {

      body.last_contacted_at =
        new Date()
          .toISOString();

    }


    if (
      stage ===
      "accepted"
      ||
      stage ===
      "lost"
    ) {

      body.status =
        "closed";


    } else if (
      stage ===
      "new"
    ) {

      body.status =
        "new";


    } else {

      body.status =
        "contacted";

    }


    try {

      await adminRequest(

        `contact_inquiries?id=eq.${encodeURIComponent(
          id
        )}`,

        {

          method:
            "PATCH",

          headers: {

            Prefer:
              "return=minimal"

          },

          body:
            JSON.stringify(
              body
            )

        }

      );


      showMessage(
        "Lead stage updated."
      );


      await loadLeads();

      renderSummary();


    } catch (error) {

      console.error(
        error
      );


      showMessage(
        "Unable to update lead."
      );

    }

  }



  // =====================================================
  // SAVE LEAD
  // =====================================================

  async function saveLead(
    id
  ) {

    const priority =
      document.querySelector(
        `[data-lead-priority="${id}"]`
      )?.value;


    const value =
      document.querySelector(
        `[data-lead-value="${id}"]`
      )?.value;


    const currency =
      document.querySelector(
        `[data-lead-currency="${id}"]`
      )?.value
        ?.trim()
        .toUpperCase();


    const followUp =
      document.querySelector(
        `[data-lead-followup="${id}"]`
      )?.value;


    const notes =
      document.querySelector(
        `[data-lead-notes="${id}"]`
      )?.value
        ?.trim();


    try {

      await adminRequest(

        `contact_inquiries?id=eq.${encodeURIComponent(
          id
        )}`,

        {

          method:
            "PATCH",

          headers: {

            Prefer:
              "return=minimal"

          },

          body:
            JSON.stringify({

              priority:
                priority ||
                "normal",

              estimated_value:
                value
                  ? Number(value)
                  : null,

              currency_code:
                currency ||
                "CAD",

              follow_up_at:
                followUp
                  ? new Date(
                      followUp
                    ).toISOString()
                  : null,

              admin_notes:
                notes ||
                null

            })

        }

      );


      showMessage(
        "Lead saved."
      );


      await loadLeads();

      renderSummary();


    } catch (error) {

      console.error(
        error
      );


      showMessage(
        "Unable to save lead."
      );

    }

  }



  // =====================================================
  // MODAL
  // =====================================================

  function openProjectModal(
    leadId
  ) {

    const lead =
      leads.find(
        item =>
          String(item.id) ===
          String(leadId)
      );


    if (!lead) {

      return;

    }


    document.getElementById(
      "projectInquiryId"
    ).value =
      lead.id;


    document.getElementById(
      "projectName"
    ).value =
      `${lead.service} — ${lead.business || lead.name}`;


    document.getElementById(
      "projectClientName"
    ).value =
      lead.name;


    document.getElementById(
      "projectClientEmail"
    ).value =
      lead.email;


    document.getElementById(
      "projectBusiness"
    ).value =
      lead.business ||
      "";


    document.getElementById(
      "projectService"
    ).value =
      lead.service;


    document.getElementById(
      "projectPrice"
    ).value =
      lead.estimated_value ??
      "";


    document.getElementById(
      "projectCurrency"
    ).value =
      lead.currency_code ||
      "CAD";


    document.getElementById(
      "projectNotes"
    ).value =
      lead.admin_notes ||
      "";


    projectModal.style.display =
      "flex";


    projectModal.setAttribute(
      "aria-hidden",
      "false"
    );

  }



  function closeProjectModal() {

    projectModal.style.display =
      "none";


    projectModal.setAttribute(
      "aria-hidden",
      "true"
    );


    projectForm?.reset();

  }



  projectModalClose?.addEventListener(
    "click",
    closeProjectModal
  );


  projectCreateCancel?.addEventListener(
    "click",
    closeProjectModal
  );


  projectModal
    ?.querySelector(
      ".pipeline-modal-backdrop"
    )
    ?.addEventListener(
      "click",
      closeProjectModal
    );



  // =====================================================
  // CREATE PROJECT
  // =====================================================

  projectForm?.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const inquiryId =
        document.getElementById(
          "projectInquiryId"
        ).value;


      const projectName =
        document.getElementById(
          "projectName"
        ).value
          .trim();


      const clientName =
        document.getElementById(
          "projectClientName"
        ).value
          .trim();


      const clientEmail =
        document.getElementById(
          "projectClientEmail"
        ).value
          .trim();


      const business =
        document.getElementById(
          "projectBusiness"
        ).value
          .trim();


      const service =
        document.getElementById(
          "projectService"
        ).value
          .trim();


      const price =
        document.getElementById(
          "projectPrice"
        ).value;


      const currency =
        document.getElementById(
          "projectCurrency"
        ).value;


      const startDate =
        document.getElementById(
          "projectStartDate"
        ).value;


      const dueDate =
        document.getElementById(
          "projectDueDate"
        ).value;


      const notes =
        document.getElementById(
          "projectNotes"
        ).value
          .trim();


      try {

        await adminRequest(

          "projects",

          {

            method:
              "POST",

            headers: {

              Prefer:
                "return=minimal"

            },

            body:
              JSON.stringify({

                inquiry_id:
                  Number(
                    inquiryId
                  ),

                project_name:
                  projectName,

                client_name:
                  clientName,

                client_email:
                  clientEmail,

                business:
                  business ||
                  null,

                service,

                status:
                  "planned",

                quoted_price:
                  price
                    ? Number(price)
                    : null,

                currency_code:
                  currency,

                start_date:
                  startDate ||
                  null,

                due_date:
                  dueDate ||
                  null,

                notes:
                  notes ||
                  null

              })

          }

        );


        await adminRequest(

          `contact_inquiries?id=eq.${encodeURIComponent(
            inquiryId
          )}`,

          {

            method:
              "PATCH",

            headers: {

              Prefer:
                "return=minimal"

            },

            body:
              JSON.stringify({

                lead_stage:
                  "accepted",

                status:
                  "closed"

              })

          }

        );


        closeProjectModal();


        showMessage(
          "Project created successfully."
        );


        await loadEverything();


      } catch (error) {

        console.error(
          error
        );


        showMessage(
          "Unable to create project. The lead may already have a project."
        );

      }

    }
  );



  // =====================================================
  // LOAD PROJECTS
  // =====================================================

  async function loadProjects() {

    if (!projectList) {

      return;

    }


    projectList.innerHTML = `

      <p class="note">
        Loading projects...
      </p>

    `;


    try {

      projects =
        await adminRequest(

          "projects?" +

          "select=" +

          "id," +
          "inquiry_id," +
          "project_name," +
          "client_name," +
          "client_email," +
          "business," +
          "service," +
          "status," +
          "priority," +
          "quoted_price," +
          "currency_code," +
          "start_date," +
          "due_date," +
          "notes," +
          "created_at," +
          "updated_at" +

          "&order=created_at.desc"

        );


      renderProjects();


    } catch (error) {

      console.error(
        error
      );


      projectList.innerHTML = `

        <p class="note">
          Unable to load projects.
        </p>

      `;

    }

  }



  // =====================================================
  // FILTER PROJECTS
  // =====================================================

  function getFilteredProjects() {

    const search =
      (
        projectSearch?.value ||
        ""
      )
        .trim()
        .toLowerCase();


    const status =
      projectStatusFilter?.value ||
      "all";


    return projects.filter(
      project => {

        if (
          status !==
          "all"
          &&
          project.status !==
          status
        ) {

          return false;

        }


        if (!search) {

          return true;

        }


        return [

          project.project_name,
          project.client_name,
          project.client_email,
          project.business,
          project.service

        ]
          .join(" ")
          .toLowerCase()
          .includes(
            search
          );

      }
    );

  }



  // =====================================================
  // RENDER PROJECTS
  // =====================================================

  function renderProjects() {

    const filtered =
      getFilteredProjects();


    if (!filtered.length) {

      projectList.innerHTML = `

        <p class="note">
          No projects found.
        </p>

      `;

      return;

    }


    projectList.innerHTML =
      filtered.map(
        project => `

          <article class="pipeline-card">


            <div class="pipeline-card-header">


              <div>

                <span class="pipeline-stage">

                  ${formatProjectStatus(
                    project.status
                  )}

                </span>


                <h3>

                  ${escapeHtml(
                    project.project_name
                  )}

                </h3>


                <a
                  href="mailto:${escapeHtml(
                    project.client_email
                  )}"
                >

                  ${escapeHtml(
                    project.client_name
                  )}

                </a>

              </div>


              <select
                data-project-status="${project.id}"
              >

                ${projectStatusOptions(
                  project.status
                )}

              </select>


            </div>



            <div class="pipeline-details">


              <div>

                <strong>
                  Service
                </strong>

                <span>

                  ${escapeHtml(
                    project.service
                  )}

                </span>

              </div>



              <div>

                <strong>
                  Business
                </strong>

                <span>

                  ${escapeHtml(
                    project.business ||
                    "—"
                  )}

                </span>

              </div>



              <div>

                <strong>
                  Quoted
                </strong>

                <span>

                  ${
                    project.quoted_price !==
                    null

                      ? formatMoney(
                          project.quoted_price,
                          project.currency_code
                        )

                      : "—"
                  }

                </span>

              </div>



              <div>

                <strong>
                  Start
                </strong>

                <span>

                  ${formatDate(
                    project.start_date
                  )}

                </span>

              </div>



              <div>

                <strong>
                  Due
                </strong>

                <span>

                  ${formatDate(
                    project.due_date
                  )}

                </span>

              </div>


            </div>



            <label>
              Project Notes
            </label>


            <textarea
              rows="5"
              maxlength="10000"
              data-project-notes="${project.id}"
            >${escapeHtml(
              project.notes ||
              ""
            )}</textarea>



            <div class="pipeline-actions">


              <button
                class="btn"
                type="button"
                data-save-project="${project.id}"
              >
                Save Notes
              </button>


              <a
                class="btn"
                href="mailto:${escapeHtml(
                  project.client_email
                )}"
              >
                Email Client
              </a>


              <button
                class="btn admin-delete"
                type="button"
                data-delete-project="${project.id}"
              >
                Delete Project
              </button>


            </div>


          </article>

        `
      )
      .join("");


    attachProjectEvents();

  }



  // =====================================================
  // PROJECT STATUS OPTIONS
  // =====================================================

  function projectStatusOptions(
    current
  ) {

    const statuses = [

      [
        "planned",
        "Planned"
      ],

      [
        "in_progress",
        "In Progress"
      ],

      [
        "review",
        "Client Review"
      ],

      [
        "on_hold",
        "On Hold"
      ],

      [
        "completed",
        "Completed"
      ],

      [
        "cancelled",
        "Cancelled"
      ]

    ];


    return statuses
      .map(
        ([value,label]) => `

          <option
            value="${value}"
            ${
              value ===
              current
                ? "selected"
                : ""
            }
          >

            ${label}

          </option>

        `
      )
      .join("");

  }



  function formatProjectStatus(
    status
  ) {

    const names = {

      planned:
        "Planned",

      in_progress:
        "In Progress",

      review:
        "Client Review",

      on_hold:
        "On Hold",

      completed:
        "Completed",

      cancelled:
        "Cancelled"

    };


    return names[status] ||
      status;

  }



  // =====================================================
  // PROJECT EVENTS
  // =====================================================

  function attachProjectEvents() {

    document
      .querySelectorAll(
        "[data-project-status]"
      )
      .forEach(
        select => {

          select.addEventListener(
            "change",
            () => {

              updateProjectStatus(

                select.dataset.projectStatus,

                select.value

              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-save-project]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              saveProjectNotes(
                button.dataset.saveProject
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-delete-project]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              deleteProject(
                button.dataset.deleteProject
              );

            }
          );

        }
      );

  }



  // =====================================================
  // UPDATE PROJECT STATUS
  // =====================================================

  async function updateProjectStatus(
    id,
    status
  ) {

    try {

      await adminRequest(

        `projects?id=eq.${encodeURIComponent(
          id
        )}`,

        {

          method:
            "PATCH",

          headers: {

            Prefer:
              "return=minimal"

          },

          body:
            JSON.stringify({
              status
            })

        }

      );


      showMessage(
        "Project status updated."
      );


      await loadProjects();

      renderSummary();


    } catch (error) {

      console.error(
        error
      );


      showMessage(
        "Unable to update project."
      );

    }

  }



  // =====================================================
  // SAVE NOTES
  // =====================================================

  async function saveProjectNotes(
    id
  ) {

    const notes =
      document.querySelector(
        `[data-project-notes="${id}"]`
      )
        ?.value
        ?.trim();


    try {

      await adminRequest(

        `projects?id=eq.${encodeURIComponent(
          id
        )}`,

        {

          method:
            "PATCH",

          headers: {

            Prefer:
              "return=minimal"

          },

          body:
            JSON.stringify({

              notes:
                notes ||
                null

            })

        }

      );


      showMessage(
        "Project notes saved."
      );


    } catch (error) {

      console.error(
        error
      );


      showMessage(
        "Unable to save notes."
      );

    }

  }



  // =====================================================
  // DELETE PROJECT
  // =====================================================

  async function deleteProject(
    id
  ) {

    if (
      !window.confirm(
        "Delete this project permanently?"
      )
    ) {

      return;

    }


    try {

      await adminRequest(

        `projects?id=eq.${encodeURIComponent(
          id
        )}`,

        {

          method:
            "DELETE",

          headers: {

            Prefer:
              "return=minimal"

          }

        }

      );


      showMessage(
        "Project deleted."
      );


      await loadProjects();

      renderSummary();


    } catch (error) {

      console.error(
        error
      );


      showMessage(
        "Unable to delete project."
      );

    }

  }



  // =====================================================
  // SUMMARY
  // =====================================================

  function renderSummary() {

    const openLeads =
      leads.filter(
        lead =>
          ![
            "accepted",
            "lost"
          ].includes(
            lead.lead_stage
          )
      ).length;


    const now =
      new Date();


    const dueFollowUps =
      leads.filter(
        lead => {

          if (
            !lead.follow_up_at
          ) {

            return false;

          }


          const date =
            new Date(
              lead.follow_up_at
            );


          return (
            date <= now
            &&
            ![
              "accepted",
              "lost"
            ].includes(
              lead.lead_stage
            )
          );

        }
      ).length;


    const activeProjects =
      projects.filter(
        project =>
          [
            "planned",
            "in_progress",
            "review",
            "on_hold"
          ].includes(
            project.status
          )
      ).length;


    const completed =
      projects.filter(
        project =>
          project.status ===
          "completed"
      ).length;


    if (openLeadCount) {

      openLeadCount.textContent =
        openLeads;

    }


    if (followUpCount) {

      followUpCount.textContent =
        dueFollowUps;

    }


    if (activeProjectCount) {

      activeProjectCount.textContent =
        activeProjects;

    }


    if (completedProjectCount) {

      completedProjectCount.textContent =
        completed;

    }

  }



  // =====================================================
  // SEARCH / FILTER
  // =====================================================

  leadSearch?.addEventListener(
    "input",
    renderLeads
  );


  leadStageFilter?.addEventListener(
    "change",
    renderLeads
  );


  projectSearch?.addEventListener(
    "input",
    renderProjects
  );


  projectStatusFilter?.addEventListener(
    "change",
    renderProjects
  );


  refreshLeads?.addEventListener(
    "click",
    loadLeads
  );


  refreshProjects?.addEventListener(
    "click",
    loadProjects
  );


})();