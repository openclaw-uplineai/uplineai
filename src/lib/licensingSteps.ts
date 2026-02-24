export type LicensingStep = {
  key: string;
  title: string;
  description?: string;
};

// Sprint 1: CA only, CA Life only.
export const CA_LIFE_STEPS: LicensingStep[] = [
  { key: "ca_confirm_residency_and_intent", title: "Confirm California + Life intent" },
  { key: "xca_create_account_or_login", title: "Create / log into XCEL account" },
  {
    key: "xca_enter_partner_code_uplineai",
    title: "Enter partner code on partner site (required)",
    description:
      "Partner code is NOT a promo code. Ensure you are on the partner site before checkout.",
  },
  { key: "xca_select_ca_life_course_package", title: "Select California Life course package" },
  { key: "xca_checkout_and_pay", title: "Checkout on XCEL" },
  { key: "xca_access_my_training", title: "Access course via My Training" },
  { key: "xca_complete_prelicensing_course", title: "Complete pre-licensing course" },
  { key: "xca_study_plan_best_practices", title: "Follow study plan + best practices" },
  { key: "xca_exam_simulators_and_review", title: "Use exam simulators + review" },
  { key: "ca_schedule_state_exam", title: "Schedule state exam" },
  { key: "ca_take_and_pass_state_exam", title: "Take and pass exam" },
  { key: "ca_application_and_state_fees", title: "Application + pay CA required state fees" },
  { key: "ca_background_check_fingerprinting", title: "Background check / fingerprinting" },
  { key: "ca_submit_license_application", title: "Submit license application" },
  { key: "ca_track_application_status", title: "Track application status" },
  { key: "ca_license_issued_complete", title: "License issued (complete)" },
];
