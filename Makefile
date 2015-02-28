dist:
	rm -rf ./build; \
	mkdir ./build; \
	for fullpath in src/*.js src/{analyzers,behaviors,buildings,creep,io,tasks}/*.js ; \
	do \
		filename="$${fullpath##*/}"; \
		cp $$fullpath build/$$filename; \
	done;
