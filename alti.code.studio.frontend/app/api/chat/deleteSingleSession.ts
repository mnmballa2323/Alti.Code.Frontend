export const deleteSingleSession = async (
  model: string,
  objectId: string,
  token: string | null | undefined,
): Promise<void> => {
  // const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${model}/delete-single-response/${objectId}`;
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/conversations/${objectId}`;

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || "Failed to delete the session");
    }
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};
