export default function reducer(state, { type, payload }) {
  switch (type) {
    case "DAILY_DATA":
      return {
        ...state,
        dailyData: payload,
      }
    default:
      return state;
  }
}