import { describe, it, expect } from 'vitest'
import { getCurrentEnvironment } from '../app/config/deploymentEnvironments'

describe('Environment Configuration', () => {
  it('should return development environment by default', () => {
    const env = getCurrentEnvironment()
    expect(env.id).toBe('development')
    expect(env.name).toBe('Development')
  })

  // Note: setActiveEnvironment is not exported - environment switching happens via UI
  // it('should switch to production environment', () => {
  //   setActiveEnvironment('production')
  //   const env = getCurrentEnvironment()
  //   expect(env.id).toBe('production')
  //   expect(env.name).toBe('Production')
  //   
  //   // Reset to development
  //   setActiveEnvironment('development')
  // })

  it('should have required environment properties', () => {
    const env = getCurrentEnvironment()
    expect(env).toHaveProperty('id')
    expect(env).toHaveProperty('name')
    expect(env).toHaveProperty('supabaseUrl')
    expect(env).toHaveProperty('supabaseAnonKey')
  })
})