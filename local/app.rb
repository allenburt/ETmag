#Require gem for mailchimp integration.
require "hominid"
require "feedzirra"

def setup_mailchimp
  unless Nesta::Config.settings.include? "mailchimp_apikey"
    Nesta::Config.settings << "mailchimp_apikey"
  end
  unless Nesta::Config.settings.include? "mailchimp_listid"
    Nesta::Config.settings << "mailchimp_listid"
  end
  
  @mailchimp ||= Hominid::Base.new({ :api_key => Nesta::Config.mailchimp_apikey })
end

get "/" do
  set_from_config(:title, :subtitle, :description, :keywords)
  @heading = @title
  @title = "#{@title} - #{@subtitle}"
  @body_class = "home_body"
  cache haml(:home, :layout => :custom_layout)
end

get "/about/?" do
  set_from_config(:title, :subtitle, :description, :keywords)
  @heading = @title
  @title = "#{@title} - #{@subtitle}"
  @body_class = "home_body"
  cache haml(:about, :layout => :custom_layout)
end

get "/contact/?" do
  set_from_config(:title, :subtitle, :description, :keywords)
  @heading = @title
  @title = "#{@title} - #{@subtitle}"
  @body_class = "home_body"  
  cache haml(:contact, :layout => :custom_layout)
end

get "/exposures/?" do
  set_common_variables
  set_from_config(:title, :subtitle, :description, :keywords)
  @feed = feed = Feedzirra::Feed.fetch_and_parse("http://epicthrills.tumblr.com/rss")
  @heading = @title
  @title = "Exposures - #{@title}"
  @pages = Page.find_articles
  @body_class = "home"
  @stylesheet = "/stylesheets/exposures.css"
  cache haml(:exposures)
end

get "/submit_form" do
  setup_mailchimp
  @listid ||= Nesta::Config.mailchimp_listid
  response = @mailchimp.subscribe(@listid, params[:email])
  response ? "true" : "false"
end
