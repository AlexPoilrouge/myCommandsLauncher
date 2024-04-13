

run: resources/app.asar
	electron resources/app.asar

build_package: npm_update
	npx electron-forge package --platform linux

install: resources/app.asar
	install -d $(prefix)/opt/myCommandsLauncher/resources
	install -Dm 655 resources/app.asar $(prefix)/opt/myCommandsLauncher/resources/app.asar
	install -Dm 755 install/launch.sh $(prefix)/opt/myCommandsLauncher/launch.sh

npm_update:
	npm update

clean:
	rm -rf node_modules resources

resources/app.asar: clean
	mkdir -p resources
	asar pack . resources/app.asar