class AddLastCommandToUser < ActiveRecord::Migration
  def self.up
    add_column :users, :last_command_id, :integer
  end

  def self.down
    remove_column :users, :last_command_id
  end
end
