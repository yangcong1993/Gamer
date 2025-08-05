'use client'

import { useRef, useCallback } from 'react'

/**
 * @description 一个用于处理游戏手柄震动反馈的 React Hook。
 * @returns {object}
 * @example
 * const { vibrateClick, vibrateTyping } = useGamepadVibration();
 * <button onClick={() => vibrateClick()}>Click me</button>
 */
export const useGamepadVibration = () => {
  const gamepadIndex = useRef<number | null>(null)

  const performVibration = useCallback(
    (effectType: GamepadHapticEffectType = 'dual-rumble', params: GamepadEffectParameters) => {
      if (!navigator.getGamepads) return

      const gamepads = navigator.getGamepads()
      if (gamepadIndex.current === null) {
        for (let i = 0; i < gamepads.length; i++) {
          if (gamepads[i]) {
            gamepadIndex.current = i
            break
          }
        }
      }

      if (gamepadIndex.current !== null) {
        const gp = gamepads[gamepadIndex.current]
        if (gp && gp.connected && gp.vibrationActuator) {
          gp.vibrationActuator.playEffect(effectType, params).catch((e) => {})
        }
      }
    },
    []
  )

  const vibrateClick = useCallback(() => {
    performVibration('dual-rumble', {
      startDelay: 0,
      duration: 100,
      weakMagnitude: 0.6,
      strongMagnitude: 0.9,
    })
  }, [performVibration])

  const vibrateTyping = useCallback(() => {
    performVibration('dual-rumble', {
      startDelay: 0,
      duration: 15,
      weakMagnitude: 0.1,
      strongMagnitude: 0.15,
    })
  }, [performVibration])

  return { vibrateClick, vibrateTyping }
}
