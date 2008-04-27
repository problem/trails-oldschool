require File.dirname(__FILE__) + '/../test_helper'
require 'task_lists_controller'

class TaskListsController
  def rescue_action(e)
    raise e
  end
end

class TaskListsControllerTest < Test::Unit::TestCase
  
  def setup
    @controller = TaskListsController.new
    @request = ActionController::TestRequest.new
    @response = ActionController::TestResponse.new
  end
  
  def test_index_not_authorized
    get :index
    assert_redirected_to :controller => "session", :action => "new"
  end
  
  def test_index_authorized
    get :index, nil, {:user_id=>users(:edward).id}
    assert_response :success
  end
  
  def test_update_not_authorized
    task_list = task_lists(:paint) # Does not belong to edward
    put :update, {:id=>task_list.id, :title=>"asdfg"}, {:user_id=>users(:edward).id}
    assert_response 422
  end
  
  def test_update_authorized
    task_list = task_lists(:book) # Belongs to edward
    put :update, {:id=>task_list.id, :title=>"asdfg"}, {:user_id=>users(:edward).id}
    assert_response :success
  end

  def test_destroy_not_authorized
    task_list = task_lists(:paint) # Does not belong to edward
    delete :destroy, {:id=>task_list.id}, {:user_id=>users(:edward).id}
    assert_response 422
  end
  
  def test_destroy_authorized
    task_list = task_lists(:book) # Belongs to edward
    delete :destroy, {:id=>task_list.id}, {:user_id=>users(:edward).id}
    assert_response :success
  end

end
