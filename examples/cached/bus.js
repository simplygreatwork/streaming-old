
export class Bus {
	
	constructor(warn) {
		
		this.warn = warn || false
		this.contexts = new Set()
		this.contexts.add('main')
		this.channels = {}
	}
	
	on(key, fn, context) {
		
		context = context || 'main'
		this.channels = this.channels || {}
		this.channels[context] = this.channels[context] || {}
		this.channels[context][key] = this.channels[context][key] || []
		this.channels[context][key].push(fn)
		return function off() {
			let index = this.channels[context][key].indexOf(fn)
			this.channels[context][key].splice(index, 1)
		}.bind(this)
	}
	
	unshift(key, fn, context) {
		
		context = context || 'main'
		this.channels = this.channels || {}
		this.channels[context] = this.channels[context] || {}
		this.channels[context][key] = this.channels[context][key] || []
		this.channels[context][key].unshift(fn)
		return function off() {
			let index = this.channels[context][key].indexOf(fn)
			this.channels[context][key].splice(index, 1)
		}.bind(this)
	}
	
	emit(key) {
		
		let state = {}
		let arguments_ = Array.from(arguments)
		arguments_ = arguments_.splice(1)
		arguments_.push(this.interruptable(state))
		this.iterate(key, state, function(fn) {
			fn.apply(this, arguments_)
		}.bind(this))
	}
	
	iterate(key, state, fn) {
		
		let found = false
		Array.from(this.contexts).reverse().forEach(function(context) {
			if (! this.channels[context]) return 
			if (! this.channels[context][key]) return
			this.channels[context][key].forEach(function(fn_) {
				found = true
				if (! state.interrupted) fn(fn_)
			}.bind(this))
		}.bind(this))
		if (this.warn && ! found) console.warn(`The bus could not find any handler for key: ${key}`)
	}
	
	interruptable(state) {
		
		return function() {
			state.interrupted = true
		}
	}
	
	replace(key, index, fn, context) {
		
		context = context || 'main'
		if (index < this.channels[context][key].length) {
			this.channels[context][key][index] = fn
		}
	}
	
	remap(from, to, context) {
		
		context = context || 'main'
		this.channels[context][to] = this.channels[context][from]
		delete this.channels[context][from]
	}
	
	context(context_) {
		
		return {
			on: (key, fn) => this.on(key, fn, context_),
			unshift: (key, fn) => this.unshift(key, fn, context_),
			emit: (key) => this.emit(...arguments),
			replace: (key, index, fn) => this.replace(key, index, fn, context_),
			remap: (from, to) => this.remap(from, to, context_)
		}
	}
}
