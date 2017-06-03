import { ACTION_NAME } from '../constants/actionTypes'

export function showModal (props) {
  return {
    type: ACTION_NAME,
    payload: props
  }
}
