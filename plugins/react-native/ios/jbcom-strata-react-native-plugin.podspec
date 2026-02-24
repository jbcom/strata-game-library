require "json"

package = JSON.parse(File.read(File.join(__dir__, "..", "package.json")))

Pod::Spec.new do |s|
  s.name         = "RNStrata"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "12.0" }
  s.source       = { :git => "https://github.com/jbcom/nodejs-strata-react-native-plugin.git", :tag => "#{s.version}" }

  s.source_files = "RNStrata/**/*.{h,m,mm,swift}"

  s.dependency "React-Core"
end
