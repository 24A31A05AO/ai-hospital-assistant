
// ============================================================
// API CLIENT
// AI HOSPITAL ASSISTANT
// ============================================================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ai-hospital-api.onrender.com";

// ============================================================
// USER TYPES
// ============================================================

export type PatientInfo = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  village?: string | null;
  role: string;
  is_active?: boolean;
};

export type User = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  village?: string | null;
  department?: string | null;
  role: string;
  is_active?: boolean;
};

// ============================================================
// ADMIN TYPES
// ============================================================

export type AdminRole =
  | "patient"
  | "doctor"
  | "admin";

export type AdminUser = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  village?: string | null;
  department?: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at?: string | null;
};

export type AdminStats = {
  total_users: number;
  total_patients: number;
  total_doctors: number;
  total_admins: number;
  total_consultations: number;
  pending_consultations: number;
  reviewed_consultations: number;
  emergency_consultations: number;
};

export type AdminUserUpdate = {
  role?: AdminRole;
  is_active?: boolean;
};

export type Doctor = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  village?: string | null;
  department?: string | null;
  role: "doctor";
  is_active: boolean;
  created_at?: string | null;
};

// ============================================================
// HOSPITAL
// ============================================================

export type Hospital = {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  qr_code_id: string;
  is_active: boolean;
  created_at: string;
};

export async function getHospitalByQr(
  qrCodeId: string
): Promise<Hospital> {
  if (!qrCodeId.trim()) {
    throw new Error("Hospital QR code is required.");
  }

  return apiRequest<Hospital>(
    `/hospitals/qr/${encodeURIComponent(qrCodeId.trim())}`
  );
}

export async function getHospitals(): Promise<Hospital[]> {
  return apiRequest<Hospital[]>("/hospitals/");
}

// ============================================================
// CONSULTATION TYPE
// ============================================================

export type Consultation = {
  id: number;
  user_id: number;

  chief_complaint?: string | null;
  symptoms?: string | null;
  medical_history?: string | null;
  medications?: string | null;
  allergies?: string | null;

  ai_summary?: string | null;

  possible_conditions:
    | string
    | string[]
    | null;

  recommended_tests:
    | string
    | string[]
    | null;

  red_flags:
    | string
    | string[]
    | null;

  department?: string | null;
  priority?: string | null;
  status?: string | null;

  doctor_notes?: string | null;

  doctor_id?: number | null;

  doctor?: {
    id: number;
    full_name: string;
    email: string;
    phone?: string | null;
    village?: string | null;
    role?: string;
    is_active?: boolean;
  } | null;

  created_at?: string | null;

  patient?: PatientInfo | null;
};

export type ConsultationCreate = {
  chief_complaint: string;
  symptoms: string;
  medical_history: string;
  medications: string;
  allergies: string;
};

// ============================================================
// AUTH TYPES
// ============================================================

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  role?: string;
  user_id?: number;
};

export type RegisterRequest = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  village: string;
};

// ============================================================
// PASSWORD RESET
// ============================================================

export type ForgotPasswordResponse = {
  message: string;
  development_token?: string;
};

// ============================================================
// API ERROR
// ============================================================

type ApiValidationError = {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
};

type ApiErrorResponse = {
  detail?:
    | string
    | ApiValidationError[];
  message?: string;
};

// ============================================================
// ERROR MESSAGE
// ============================================================

function getErrorMessage(
  data: unknown,
  status: number
): string {
  if (
    data &&
    typeof data === "object"
  ) {
    const errorData =
      data as ApiErrorResponse;

    if (
      typeof errorData.detail ===
      "string"
    ) {
      return errorData.detail;
    }

    if (
      Array.isArray(errorData.detail)
    ) {
      return errorData.detail
        .map((item) => {
          if (
            typeof item === "string"
          ) {
            return item;
          }

          const location =
            Array.isArray(item.loc)
              ? item.loc.join(" → ")
              : "";

          const message =
            item.msg ||
            "Validation error";

          return location
            ? `${location}: ${message}`
            : message;
        })
        .join("\n");
    }

    if (
      typeof errorData.message ===
      "string"
    ) {
      return errorData.message;
    }
  }

  return `Request failed with status ${status}`;
}

// ============================================================
// API REQUEST
// ============================================================

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "access_token"
        )
      : null;

  const headers = new Headers(
    options.headers
  );

  headers.set(
    "Accept",
    "application/json"
  );

  if (options.body) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );
  } catch (error) {
    console.error(
      "Backend connection error:",
      error
    );

    throw new Error(
      `Unable to connect to the backend server at ${API_BASE_URL}. Make sure FastAPI is running.`
    );
  }

  let data: unknown = null;

  const contentType =
    response.headers.get(
      "content-type"
    );

  if (
    contentType?.includes(
      "application/json"
    )
  ) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text =
        await response.text();

      data = text || null;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        response.status
      )
    );
  }

  return data as T;
}

// ============================================================
// REGISTER
// ============================================================

export async function registerUser(
  user: RegisterRequest
): Promise<User> {
  const response =
    await apiRequest<{
      message?: string;
      user?: User;
    }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(user),
      }
    );

  if (response.user) {
    return response.user;
  }

  return response as unknown as User;
}

// ============================================================
// LOGIN
// ============================================================

export async function loginUser(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const email =
    credentials?.email?.trim() || "";

  const password =
    credentials?.password || "";

  if (!email) {
    throw new Error(
      "Email is required."
    );
  }

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  const body =
    new URLSearchParams();

  body.set(
    "username",
    email
  );

  body.set(
    "password",
    password
  );

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          Accept:
            "application/json",
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body:
          body.toString(),
      }
    );
  } catch (error) {
    console.error(
      "Login connection error:",
      error
    );

    throw new Error(
      `Unable to connect to the backend server at ${API_BASE_URL}. Make sure FastAPI is running.`
    );
  }

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        response.status
      )
    );
  }

  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "Invalid login response from backend."
    );
  }

  const loginData =
    data as LoginResponse;

  if (
    !loginData.access_token
  ) {
    throw new Error(
      "Login succeeded but the backend did not return an access token."
    );
  }

  if (
    typeof window !== "undefined"
  ) {
    localStorage.setItem(
      "access_token",
      loginData.access_token
    );

    if (loginData.role) {
      localStorage.setItem(
        "user_role",
        loginData.role
      );
    }

    if (
      loginData.user_id !==
      undefined
    ) {
      localStorage.setItem(
        "user_id",
        String(
          loginData.user_id
        )
      );
    }
  }

  return loginData;
}

// ============================================================
// LOGOUT
// ============================================================

export function logoutUser(): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "user_role"
  );

  localStorage.removeItem(
    "user_id"
  );
}

// ============================================================
// FORGOT PASSWORD
// ============================================================

export async function forgotPassword(
  email: string
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({
        email: email.trim(),
      }),
    }
  );
}

// ============================================================
// RESET PASSWORD
// ============================================================

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  if (!token.trim()) {
    throw new Error(
      "Password reset token is required."
    );
  }

  if (!newPassword) {
    throw new Error(
      "New password is required."
    );
  }

  if (newPassword.length < 8) {
    throw new Error(
      "Password must be at least 8 characters long."
    );
  }

  return apiRequest<{
    message: string;
  }>(
    "/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify({
        token,
        new_password:
          newPassword,
      }),
    }
  );
}

// ============================================================
// CURRENT USER
// ============================================================

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>(
    "/users/me"
  );
}

// ============================================================
// CREATE CONSULTATION
// ============================================================

export async function createConsultation(
  consultation: ConsultationCreate
): Promise<Consultation> {
  return apiRequest<Consultation>(
    "/consultations/",
    {
      method: "POST",
      body: JSON.stringify(
        consultation
      ),
    }
  );
}

// ============================================================
// PATIENT CONSULTATIONS
// ============================================================

export async function getPatientConsultations(): Promise<
  Consultation[]
> {
  return apiRequest<Consultation[]>(
    "/consultations/my"
  );
}

// ============================================================
// SINGLE CONSULTATION
// ============================================================

export async function getConsultation(
  consultationId: number
): Promise<Consultation> {
  return apiRequest<Consultation>(
    `/consultations/${consultationId}`
  );
}

// ============================================================
// DOCTOR CONSULTATIONS
// ============================================================

export async function getDoctorConsultations(): Promise<
  Consultation[]
> {
  return apiRequest<Consultation[]>(
    "/doctor/consultations"
  );
}

export async function getDoctorConsultation(
  consultationId: number
): Promise<Consultation> {
  return apiRequest<Consultation>(
    `/doctor/consultations/${consultationId}`
  );
}

// ============================================================
// UPDATE DOCTOR CONSULTATION
// ============================================================

export async function updateDoctorConsultation(
  consultationId: number,
  status?: string,
  doctorNotes?: string
): Promise<Consultation> {
  const params =
    new URLSearchParams();

  if (
    status !== undefined &&
    status !== null
  ) {
    params.set(
      "status",
      status
    );
  }

  if (
    doctorNotes !== undefined &&
    doctorNotes !== null
  ) {
    params.set(
      "doctor_notes",
      doctorNotes
    );
  }

  const query =
    params.toString();

  const endpoint =
    `/doctor/consultations/${consultationId}` +
    (query
      ? `?${query}`
      : "");

  return apiRequest<Consultation>(
    endpoint,
    {
      method: "PATCH",
    }
  );
}

// ============================================================
// ADMIN STATS
// ============================================================

export async function getAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>(
    "/admin/stats"
  );
}

// ============================================================
// ADMIN USERS
// ============================================================

export async function getAdminUsers(): Promise<
  AdminUser[]
> {
  return apiRequest<AdminUser[]>(
    "/admin/users"
  );
}

// ============================================================
// SINGLE ADMIN USER
// ============================================================

export async function getAdminUser(
  userId: number
): Promise<AdminUser> {
  return apiRequest<AdminUser>(
    `/admin/users/${userId}`
  );
}

// ============================================================
// UPDATE ADMIN USER
// ============================================================

export async function updateAdminUser(
  userId: number,
  update: AdminUserUpdate
): Promise<AdminUser> {
  return apiRequest<AdminUser>(
    `/admin/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(update),
    }
  );
}

// ============================================================
// ADMIN DOCTORS
//
// ONLY users with:
// role = "doctor"
// is_active = true
//
// are returned.
// ============================================================

export async function getAdminDoctors(): Promise<
  Doctor[]
> {
  return apiRequest<Doctor[]>(
    "/admin/doctors"
  );
}

// ============================================================
// ADMIN CONSULTATIONS
// ============================================================

export async function getAdminConsultations(): Promise<
  Consultation[]
> {
  return apiRequest<Consultation[]>(
    "/admin/consultations"
  );
}

// ============================================================
// SINGLE ADMIN CONSULTATION
// ============================================================

export async function getAdminConsultation(
  consultationId: number
): Promise<Consultation> {
  return apiRequest<Consultation>(
    `/admin/consultations/${consultationId}`
  );
}

// ============================================================
// ASSIGN DOCTOR
// ============================================================

export async function assignDoctor(
  consultationId: number,
  doctorId: number
): Promise<Consultation> {
  return apiRequest<Consultation>(
    `/admin/consultations/${consultationId}/assign`,
    {
      method: "PATCH",
      body: JSON.stringify({
        doctor_id: doctorId,
      }),
    }
  );
}

// ============================================================
// UNASSIGN DOCTOR
// ============================================================

export async function unassignDoctor(
  consultationId: number
): Promise<Consultation> {
  return apiRequest<Consultation>(
    `/admin/consultations/${consultationId}/unassign`,
    {
      method: "PATCH",
    }
  );
}

// ============================================================
// DOCTOR APPOINTMENTS
// ============================================================

export type AppointmentPatient = {
  id: number;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  village?: string | null;
};

export type Appointment = {
  id: number;

  patient_id: number;
  hospital_id: number;
  doctor_id: number | null;
  consultation_id: number | null;

  department: string;

  appointment_date: string;
  appointment_time: string;

  queue_number: number | null;

  priority: string;
  status: string;

  notes: string | null;

  created_at: string | null;

  patient: AppointmentPatient | null;
};

export async function getDoctorAppointments(): Promise<
  Appointment[]
> {
  return apiRequest<Appointment[]>(
    "/appointments/doctor"
  );
}