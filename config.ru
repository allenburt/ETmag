require "rubygems"
require "sinatra"
require "hassle"
require "haml"
require "app"

use Hassle
run Sinatra::Application
