import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock react-i18next cho môi trường test
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (options && typeof options === 'object') {
        let res = key
        Object.keys(options).forEach((optKey) => {
          res += ` ${optKey}:${options[optKey]}`
        })
        return res
      }
      return key
    },
    i18n: {
      changeLanguage: () => new Promise(() => {}),
      language: 'vi',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}))
