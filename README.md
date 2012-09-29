# bckspc-status

## description

this is a little helper class for the backspace status api for several node.js projects


## events

###  member_count
Fired if the current member count changed

Args: members(int), data

### space_closed
Triggered if the last members leaves the backspace

Args: members(int), data

### space_open
Triggered if the first member was detected

Args: members(int), data

### member_joined
If a one or more members entered the space, this event is fired

Args: members[], data

### member_parted
Fired if a member left the space

Args: members[], data
