require 'json'

begin
  package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))
rescue => e
  raise "Failed to read package.json: #{e.message}"
end

Pod::Spec.new do |s|
  s.name         = 'Strata'
  s.version      = package['version'] || '1.0.0'
  s.summary      = package['description'] || 'React Native plugin for Strata 3D'
  s.homepage     = package['homepage'] || ''
  s.license      = package['license'] || 'MIT'
  s.author       = package['author'] || 'JB.com'
  s.source       = { :git => (package.dig('repository', 'url') || ''), :tag => s.version }
  s.source_files = '*.{h,m,swift}'
  s.platform     = :ios, '14.0'
  s.swift_version = '5.0'

  s.dependency 'React-Core'
end
