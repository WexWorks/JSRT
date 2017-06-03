import {} from '../constants/actionTypes'

export function showModal (props) {
  return {
    type: SHOW_MODAL,
    payload: props
  }
}

export function hideModal () {
  return {
    type: HIDE_MODAL,
    payload: null
  }
}

export function startDragging (type, data) {
  return ({
    type: SET_DRAGGING,
    payload: {type, ...data}  // expand data e.g. dragInfo.assetIds
  })
}

export function stopDragging () {
  return ({
    type: SET_DRAGGING,
    payload: null
  })
}
