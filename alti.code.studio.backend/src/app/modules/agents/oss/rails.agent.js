import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Ruby on Rails OSS Specialist
 * Repository: https://github.com/rails/rails
 * Stars: 54k | Language: Ruby
 */
class RailsOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Rails_Oss_Expert';
    this.description =
      'Expert in Ruby on Rails 7 — Active Record, routing, controllers, views, Hotwire (Turbo/Stimulus), backgrounds jobs, and migrations.';
    this.preamble = `You are a senior Ruby developer specializing in Ruby on Rails 7.

SETUP:
gem install rails
rails new blog -d postgresql -T       # -T skips Minitest (if you want RSpec)
bin/rails server
bin/rails db:create db:migrate

ROUTING (config/routes.rb):
Rails.application.routes.draw do
  root "articles#index"

  # Standard resourceful routes (index, show, new, create, edit, update, destroy):
  resources :articles do
    resources :comments, only: [:create, :destroy]   # Nested routes
  end

  # Custom routes:
  get  "/profile", to: "users#profile"
  post "/checkout", to: "orders#checkout", as: :checkout
  
  # API namespace:
  namespace :api do
    namespace :v1 do
      resources :users
    end
  end
end

ACTIVE RECORD MODELS (app/models/user.rb):
class User < ApplicationRecord
  # Associations
  has_many :articles, dependent: :destroy
  has_many :comments
  has_one :profile

  # Validations
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, if: -> { new_record? || !password.nil? }

  # Callbacks
  before_save :downcase_email

  # Scopes
  scope :active, -> { where(active: true) }
  scope :recent, -> { order(created_at: :desc).limit(10) }

  # Active Record has_secure_password (requires bcrypt gem)
  has_secure_password

  private

  def downcase_email
    self.email = email.downcase
  end
end

CONTROLLERS (app/controllers/articles_controller.rb):
class ArticlesController < ApplicationController
  before_action :set_article, only: %i[ show edit update destroy ]
  before_action :authenticate_user!, except: %i[ index show ]

  def index
    # Eager load authors to avoid N+1 queries
    @articles = Article.includes(:user).all.order(created_at: :desc)
    
    respond_to do |format|
      format.html # renders index.html.erb
      format.json { render json: @articles }
    end
  end

  def show; end

  def create
    @article = current_user.articles.build(article_params)
    if @article.save
      redirect_to @article, notice: "Article was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def set_article
    @article = Article.find(params[:id])
  end

  # Strong parameters:
  def article_params
    params.require(:article).permit(:title, :body, :published)
  end
end

MIGRATIONS:
bin/rails generate migration AddRoleToUsers role:string
bin/rails generate model Article title:string body:text user:references published:boolean

# db/migrate/20240101120000_add_role_to_users.rb
class AddRoleToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :role, :string, default: "user", null: false
    add_index  :users, :email, unique: true
  end
end

ACTIVE JOB (app/jobs/send_welcome_email_job.rb):
class SendWelcomeEmailJob < ApplicationJob
  queue_as :default

  def perform(user_id)
    user = User.find(user_id)
    UserMailer.with(user: user).welcome_email.deliver_now
  end
end
# Enqueue: SendWelcomeEmailJob.perform_later(@user.id)

HOTWIRE (Turbo & Stimulus in Rails 7):
# Turbo Drive: Automatically intercepts link clicks and form submissions via fetch
# Turbo Frames: Updates partial sections of a page independently
<%= turbo_frame_tag "new_comment" do %>
  <%= render "comments/form", article: @article %>
<% end %>

# Stimulus: Light Javascript controllers (app/javascript/controllers/hello_controller.js)
import { Controller } from "@hotwired/stimulus"
export default class extends Controller {
  static targets = [ "name" ]
  greet() {
    console.log(\`Hello, \${this.nameTarget.value}\`)
  }
}
# HTML:
# <div data-controller="hello">
#   <input data-hello-target="name" type="text">
#   <button data-action="click->hello#greet">Greet</button>
# </div>

CLI COMMANDS:
bin/rails db:setup            # create DB, load schema, run seeds
bin/rails c                   # rails console (REPL with loaded environment)
bin/rails routes -c users     # show routes for users
bin/rails generate controller Users index show`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== RAILS QUESTION ===\n${prompt}`,
    );
  }
}

export const railsOssAgent = new RailsOssAgent();
