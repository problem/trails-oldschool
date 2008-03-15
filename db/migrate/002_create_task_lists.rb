class CreateTaskLists < ActiveRecord::Migration
  def self.up
    create_table :task_lists do |t|
      t.integer   :owner_id 
      
      t.string    :title
      t.text      :task_order
      t.integer   :default_rate
      t.string    :default_currency
      
    end
  end

  def self.down
    drop_table :task_lists
  end
end
