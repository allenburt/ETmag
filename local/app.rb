#Require gem for mailchimp integration.
require "hominid"
require "feedzirra"
require "digest/md5"
require "mongo"
require "uri"
require "pony"

def setup_mailchimp
  unless Nesta::Config.settings.include? "mailchimp_apikey"
    Nesta::Config.settings << "mailchimp_apikey"
  end
  unless Nesta::Config.settings.include? "mailchimp_listid"
    Nesta::Config.settings << "mailchimp_listid"
  end
  
  @mailchimp ||= Hominid::API.new(Nesta::Config.mailchimp_apikey)
end

def setup_mongo
  if ENV['MONGOHQ_URL'].blank?
    @db ||= Mongo::Connection.new.db('epicthrills')
  else
    uri = URI.parse(ENV['MONGOHQ_URL'])
    conn = Mongo::Connection.new(uri.host, uri.port)
    @db = conn.db(uri.path.gsub(/^\//, ''))
    @db.authenticate(uri.user, uri.password)
  end
end

def send_ref_email(email)
  Pony.mail(:to => email,
            :from => 'admin@epicthrills.com',
            :subject => 'Subject goes here',
            :body => 'Body goes here',
            :via => :smtp,
            :smtp => {
                       :port => '25',
                       :user => ENV['SENDGRID_USERNAME'],
                       :password => ENV['SENDGRID_PASSWORD'],
                       :host => 'smtp.sendgrid.net',
                       :auth => :plain,
                       :domain => ENV['SENDGRID_DOMAIN']
                     })
end

get "/" do
  if params[:r]
    session[:referrer] = params[:r]
  end
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
  setup_mongo
  @listid ||= Nesta::Config.mailchimp_listid
  if params[:r]
    ref = @db['contacts'].find_one :ref_id => params[:r]
    @db['contacts'].update({:_id => ref["_id"]}, {"$inc" => {"ref_count" => 1}})
    if ref && ref['ref_count'] == 3
      send_ref_email(ref['email'])
    end
  end
  contact = @db['contacts'].find_one :email => params[:email]
  id = ""
  response = 'false'
  if contact.nil?
    id = Digest::MD5.hexdigest(params[:email]+"_epicthrills")[0,6]
    @db['contacts'].save :email => params[:email],
                         :ref_id => id,
                         :ref_by => params[:r],
                         :ref_count => 0
    response = id
    begin
      @mailchimp.list_subscribe(@listid, params[:email])
    rescue
      response = 'exists'
    end
  else
    response = 'exists'
  end
  response
end
