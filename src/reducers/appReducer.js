import {
  SHOW_MODAL, HIDE_MODAL, SORT_FOLDERS,
  ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS, LIGHTBAR_FIELDS, ASSET_FIELDS,
  SHOW_IMPORT_SCRIPT_INFO,
  SET_DRAGGING, SET_TABLE_FIELD_WIDTH,
  THUMB_SIZE, THUMB_LAYOUT, SHOW_TABLE, TABLE_HEIGHT,
  SHOW_MULTIPAGE, SHOW_PAGES, VIDEO_VOLUME,
  HOVER_FIELD, CLEAR_HOVER_FIELD,
  USER_SETTINGS, UNAUTH_USER
} from '../constants/actionTypes'
import { DEFAULT_THUMBSIZE } from '../actions/appActions'

export const defaultTableFieldWidth = 100
export const defaultMetadataFields = [ 'source.filename', 'source.date', 'source.fileSize' ]
export const defaultLightbarFields = [ 'source.filename', 'source.date' ]
const initialState = {
  modal: null,
  leftSidebarIsIconified: false,
  rightSidebarIsIconified: true,
  collapsibleOpen: {
    browsing: false,
    collection: false,
    smart: false,
    simple: false,
    metadata: false,
    source: false,
    proxies: false,
    'proxies.proxies': false
  },
  metadataFields: [ ...defaultMetadataFields ],
  lightbarFields: [ ...defaultLightbarFields ],
  tableFieldWidth: Object.assign({},
    ...defaultMetadataFields.map(field => ({ [field]: defaultTableFieldWidth }))),
  showImportScriptInfo: true,
  thumbSize: DEFAULT_THUMBSIZE,
  thumbLayout: 'masonry',
  tableHeight: 300,
  showTable: false,
  videoVolume: 0.8,
  showMultipage: true,
  showPages: false,
  sortFolders: 'alpha-asc',
  hoverFields: new Set(),
  userSettings: {
    metadataFields: [ ...defaultMetadataFields ],
    showTable: false,
    tableHeight: 300,
    thumbSize: DEFAULT_THUMBSIZE,
    thumbLayout: 'masonry',
    videoVolume: 0.8
  }
}

export default function app (state = initialState, action) {
  switch (action.type) {
    case SHOW_MODAL:
      return { ...state, modal: action.payload }
    case HIDE_MODAL:
      return { ...state, modal: null }
    case ICONIFY_LEFT_SIDEBAR:
      return { ...state, leftSidebarIsIconified: action.payload }
    case ICONIFY_RIGHT_SIDEBAR:
      return { ...state, rightSidebarIsIconified: action.payload }
    case TOGGLE_COLLAPSIBLE:
      const { collapsibleName, isOpen } = action.payload
      const collapsibleOpen = state.collapsibleOpen
      return { ...state, collapsibleOpen: { ...collapsibleOpen, [collapsibleName]: isOpen } }
    case ASSET_FIELDS: {
      // Remove any metadata or table fields that are not in the current repo
      const fieldSet = new Set()
      const fields = action.payload
      Object.keys(fields).forEach(type => { fields[type].forEach(field => { fieldSet.add(field) }) })
      const metadataFields = state.metadataFields.filter(field => fieldSet.has(field))
      return { ...state, metadataFields }
    }
    case METADATA_FIELDS:
      // set default table widths for all new fields we haven't seen or set yet
      const tableFieldWidth = {
        // Start with the default width for all fields in response.
        ...Object.assign({}, ...action.payload.map(field => ({ [field]: defaultTableFieldWidth }))),
        // Override with all values we already have. Any new ones will be left at default width.
        ...state.tableFieldWidth
      }
      return { ...state, metadataFields: action.payload, tableFieldWidth }
    case LIGHTBAR_FIELDS:
      return { ...state, lightbarFields: action.payload }
    case SHOW_IMPORT_SCRIPT_INFO:
      return { ...state, showImportScriptInfo: action.payload }
    case SET_DRAGGING:
      return { ...state, dragInfo: action.payload }
    case SET_TABLE_FIELD_WIDTH:
      return { ...state, tableFieldWidth: { ...state.tableFieldWidth, ...action.payload } }
    case THUMB_SIZE:
      return { ...state, thumbSize: action.payload }
    case THUMB_LAYOUT:
      return { ...state, thumbLayout: action.payload }
    case SHOW_TABLE:
      return { ...state, showTable: action.payload }
    case TABLE_HEIGHT:
      return { ...state, tableHeight: action.payload }
    case VIDEO_VOLUME:
      return { ...state, videoVolume: action.payload }
    case SHOW_MULTIPAGE:
      return { ...state, showMultipage: action.payload, showPages: action.payload }
    case SHOW_PAGES:
      return { ...state, showPages: action.payload }
    case SORT_FOLDERS:
      return { ...state, sortFolders: action.payload }
    case HOVER_FIELD: {
      const hoverFields = new Set(state.hoverFields)
      hoverFields.add(action.payload)
      return { ...state, hoverFields }
    }
    case CLEAR_HOVER_FIELD: {
      const hoverFields = new Set(state.hoverFields)
      hoverFields.delete(action.payload)
      return { ...state, hoverFields }
    }
    case USER_SETTINGS:
      return { ...state, userSettings: action.payload.metadata }
    case UNAUTH_USER:
      return initialState
    default:
      return state
  }
}
