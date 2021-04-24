enum ActionTypes {
  INIT_APPLICATION = '@core/store/INIT_APPLICATION',
  INIT_APPLICATION_SUCCESS = '@core/store/INIT_APPLICATION_SUCCESS',
  ADD_COMMAND_META = '@core/store/ADD_COMMAND_META',
  // Prepaid command before run it
  VERIFY_COMMAND = '@core/store/VERIFY_COMMAND',
  // Run command in different mode
  RUN_ASYNC_COMMAND = '@core/store/RUN_ASYNC_COMMAND',
  RUN_QUEUED_COMMAND = '@core/store/RUN_QUEUED_COMMAND',
  // Cooldown actions
  ADD_COOLDOWN = '@core/store/UPDATE_COOLDOWN',
  // Access Token actions
  UPDATE_ACCESS_TOKEN = '@core/store/UPDATE_ACCESS_TOKEN',
  // Channel Actions
  UPDATE_CHANNEL = '@core/store/UPDATE_CHANNEL',
  UPDATE_CHANNEL_MEMBER = '@core/store/UPDATE_CHANNEL_MEMBER',
  DELETE_CACHED_CHANNEL = '@core/store/DELETE_CHANNEL'
}

export default ActionTypes;
