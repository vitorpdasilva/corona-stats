export default function( state, { type, payload }) {
  switch(type) {
    case "GET_DATA": 
      return {
        ...state,
        data: payload,
      }
    default:
      return state;
  }
}