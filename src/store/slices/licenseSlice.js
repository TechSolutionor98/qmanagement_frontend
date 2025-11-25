import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  licenses: [],
  currentLicense: null,
  licenseReport: null,
  loading: false,
  error: null,
}

const licenseSlice = createSlice({
  name: "license",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    setLicenses: (state, action) => {
      state.licenses = action.payload
      state.loading = false
      state.error = null
    },
    setCurrentLicense: (state, action) => {
      state.currentLicense = action.payload
      state.loading = false
      state.error = null
    },
    setLicenseReport: (state, action) => {
      state.licenseReport = action.payload
      state.loading = false
      state.error = null
    },
    addLicense: (state, action) => {
      state.licenses.unshift(action.payload)
      state.loading = false
      state.error = null
    },
    updateLicense: (state, action) => {
      const index = state.licenses.findIndex(license => license.id === action.payload.id)
      if (index !== -1) {
        state.licenses[index] = { ...state.licenses[index], ...action.payload }
      }
      state.loading = false
      state.error = null
    },
    removeLicense: (state, action) => {
      state.licenses = state.licenses.filter(license => license.id !== action.payload)
      state.loading = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    resetLicenseState: () => initialState,
  },
})

export const {
  setLoading,
  setError,
  setLicenses,
  setCurrentLicense,
  setLicenseReport,
  addLicense,
  updateLicense,
  removeLicense,
  clearError,
  resetLicenseState,
} = licenseSlice.actions

// Selectors
export const selectLicenses = (state) => state.license.licenses
export const selectCurrentLicense = (state) => state.license.currentLicense
export const selectLicenseReport = (state) => state.license.licenseReport
export const selectLicenseLoading = (state) => state.license.loading
export const selectLicenseError = (state) => state.license.error

export default licenseSlice.reducer
