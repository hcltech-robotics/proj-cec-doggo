# DEV notes

## Start the app in ubuntu

- Start with `wezterm start -- --dev-layout` 
- you need to have the config below at ~/.wezter.lua
- you need to have the project at ~/project/hackathon-robotics
- you need to have firefox, foxglove-studio, ros2 installed, and python3 

```lua
local wezterm = require 'wezterm'
local config = wezterm.config_builder()

-- Project configuration
local PROJECT = {
  root = '~/project/hackathon-robotics',
  components = {
    base = '~/project/hackathon-robotics/components',
    simulator = '~/project/hackathon-robotics/components/simulator',
    rosbag = '~/project/hackathon-robotics/components/ros-playback/1'
  },
  web = {
    port = '5173',
    path = ''
  }
}

-- Function to create the development layout
local function create_dev_layout(window, pane)
  local status, err = pcall(function()
    -- Split the window into 4 panes
    local pane0 = pane:split({
      direction = 'Right',
      size = 0.5,
    })
    local pane1 = pane:split({
      direction = 'Right',
      size = 0.5,
    })
    
    local pane2 = pane:split({
      direction = 'Bottom',
      size = 0.5,
    })
    
    local pane3 = pane1:split({
      direction = 'Bottom',
      size = 0.5,
    })
    
    -- Wait a bit for the shells to be ready
    wezterm.sleep_ms(500)
    
    -- Send commands to each pane using variables
    pane0:send_text(string.format('cd %s && npm run dev\n', PROJECT.components.simulator))
    
    pane2:send_text('pyenv shell system && ros2 launch foxglove_bridge foxglove_bridge_launch.xml send_buffer_limit:=100000000\n')
    
    pane1:send_text(string.format('cd %s && ros2 bag play --loop ./rosbag2_2025_01_10-13_18_20_0_compressed.mcap\n', PROJECT.components.rosbag))
    
    -- For the last pane, send commands sequentially
    pane3:send_text('foxglove-studio "foxglove://open?ds=foxglove-websocket&ds.url=ws://localhost:8765/"\n')
    wezterm.sleep_ms(1000)  -- Wait for the first command to start
    
    -- Launch Firefox with the localhost site
    wezterm.sleep_ms(5000)  -- Wait for the first command to start
    os.execute(string.format('firefox http://localhost:%s/%s &', PROJECT.web.port, PROJECT.web.path))
  end)
  
  if not status then
    wezterm.log_error("Error in create_dev_layout:", err)
  end
end

-- Handle CLI arguments with improved error handling
wezterm.on('gui-startup', function(cmd)
  local status, err = pcall(function()
    if cmd and cmd.args and cmd.args[1] == "--dev-layout" then
      -- Create a new workspace
      local workspace = wezterm.mux.get_active_workspace()
      
      -- Spawn the initial window in a protected call
      local window, pane
      status, window, pane = pcall(function()
        return wezterm.mux.spawn_window({
          workspace = workspace,
        })
      end)
      
      if status and window and pane then
        create_dev_layout(window, pane)
      else
        wezterm.log_error("Failed to spawn window:", err)
      end
    end
  end)
  
  if not status then
    wezterm.log_error("Error in gui-startup:", err)
  end
end)

-- General configuration
config.default_prog = { '/bin/bash' }
config.initial_rows = 40
config.initial_cols = 120

-- Tab bar configuration
config.use_fancy_tab_bar = true
config.tab_bar_at_bottom = false
config.tab_max_width = 25
config.enable_tab_bar = true

-- Set exit behavior to Hold to see error messages
config.exit_behavior = "Hold"


return config
```