export default function reducer(state, { type, payload }) {
  switch (type) {
    case "DAILY_DATA":
      return {
        ...state,
        dailyData: payload,
      }
    case "SELECT_COUNTRY":
      return {
        ...state,
        selectedCountry: payload,
      }
    case "OPENED_SIDEBAR":
      return {
        ...state,
        sidebarOpen: payload,
      }
    default:
      return state;
  }
}