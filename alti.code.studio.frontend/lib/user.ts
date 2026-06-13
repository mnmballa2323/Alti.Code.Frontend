export const getUserData = async (accessToken: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api/v1";
    const response = await fetch(
      `${apiUrl}/auth/user/single-user`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { success: false, message: result.message || "Failed to fetch user data" };
    }

    return result;
  } catch (error) {
    // Return a failure object instead of throwing so it doesn't crash the Next.js app 
    // when the backend server is not running locally.
    console.warn("Backend unreachable for getUserData:", error);
    return { success: false, message: "Network error or backend is unreachable." };
  }
};
