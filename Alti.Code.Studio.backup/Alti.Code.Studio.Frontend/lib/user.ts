export const getUserData = async (accessToken: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/user/single-user`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const result = await response.json();
    console.log(result, 'get user');

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch user data');
    }

    return result;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const updateUserData = async (userId: string, data: any, accessToken: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/user/${userId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to update user data');
    }

    return result;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};
