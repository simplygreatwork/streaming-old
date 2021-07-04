
import { greet, deliver, terminate } from '../../source/types.js'
import { pipe } from '../../source/pipe.js'
import { to_iterable } from '../../source/to-iterable.js'

const iterator = pipe(
  pullable_source(),
  to_iterable
)

console.log('iterator.next(): ' + iterator.next().value)
console.log('iterator.next(): ' + iterator.next().value)
console.log('iterator.next(): ' + iterator.next().value)
console.log('iterator.next(): ' + iterator.next().value)

if (false) for (let each of iterator) {
	console.log('each: ' + each)
}

function pullable_source() {
	
	const range = [10, 20]
	return function(start, sink) {
		if (start !== greet) return
		let index = range[0]
		sink(greet, function(type, data) {
			if (type === deliver) {
				if (index <= range[1]) {
					sink(deliver, index)
					console.log(`Source delivered value "${index}" on demand.`)
					index++
				} else {
					sink(terminate)
				}
			}
		})
	}
}
