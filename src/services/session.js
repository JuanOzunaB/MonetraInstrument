export const session = {
  save(id, name, type) {
    sessionStorage.setItem('instrument_session_id', id);
    sessionStorage.setItem('instrument_session_name', name);
    sessionStorage.setItem('instrument_session_type', type);
  },
  getId()   { return sessionStorage.getItem('instrument_session_id'); },
  getName() { return sessionStorage.getItem('instrument_session_name'); },
  getType() { return sessionStorage.getItem('instrument_session_type'); },
  clear() {
    sessionStorage.removeItem('instrument_session_id');
    sessionStorage.removeItem('instrument_session_name');
    sessionStorage.removeItem('instrument_session_type');
  },
};

export default session;
