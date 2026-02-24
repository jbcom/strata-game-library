require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name = 'StrataPlugin'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url'].gsub(/^git\+/, '').gsub(/\.git$/, '')
  s.author = package['author']
  s.source = { :git => package['repository']['url'].gsub(/^git\+/, ''), :tag => s.version.to_s }
  s.source_files = '*.swift'
  s.ios.deployment_target = '14.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'
  s.frameworks = 'UIKit', 'GameController', 'AudioToolbox'
end
