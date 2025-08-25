export const getSFTChecklist = async (url) => {
  url += `?action=GET_SFT_CHECKLIST`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    // console.log("Data:", data.data);

    return data.data;
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

export const getActivityList = async (url) => {
  url += `?action=GET_SCHOOL_LIST`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Data:", data.data);

    return data.data;
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

export const updateAttendance = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    return true;
  } catch (e) {
    console.error("Failed to update attendance:", e.message);
    return false;
  }
};
