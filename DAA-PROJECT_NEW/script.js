// Graph class to handle both adjacency matrix and list representations
class Graph {
    constructor(vertices, edges) {
        // Validate input parameters
        if (!Number.isInteger(vertices) || vertices < 1) {
            throw new Error("Number of vertices must be a positive integer");
        }
        if (!Array.isArray(edges)) {
            throw new Error("Edges must be an array");
        }

        this.size = vertices;
        this.matrix = Array(vertices).fill().map(() => Array(vertices).fill(0));
        this.adjacencyList = Array(vertices).fill().map(() => []);
        this.edgeCount = 0;

        // Validate and add edges
        for (const edge of edges) {
            if (!Array.isArray(edge) || edge.length !== 2) {
                throw new Error("Each edge must be an array of two numbers");
            }
            const [from, to] = edge;
            if (!this.isValidVertex(from) || !this.isValidVertex(to)) {
                throw new Error(`Invalid edge ${from},${to}: vertices must be between 0 and ${vertices - 1}`);
            }
            if (from === to) {
                throw new Error(`Self-loop detected at vertex ${from}`);
            }
            this.matrix[from][to] = 1;
            this.adjacencyList[from].push(to);
            this.edgeCount++;
        }

        // Check for cycles
        if (this.hasCycle()) {
            throw new Error("Graph contains a cycle. Must be acyclic for topological sort.");
        }
    }

    isValidVertex(v) {
        return Number.isInteger(v) && v >= 0 && v < this.size;
    }

    hasCycle() {
        const visited = new Set();
        const recursionStack = new Set();

        const dfsCheckCycle = (vertex) => {
            visited.add(vertex);
            recursionStack.add(vertex);

            for (const neighbor of this.adjacencyList[vertex]) {
                if (!visited.has(neighbor)) {
                    if (dfsCheckCycle(neighbor)) {
                        return true;
                    }
                } else if (recursionStack.has(neighbor)) {
                    return true;
                }
            }

            recursionStack.delete(vertex);
            return false;
        };

        for (let vertex = 0; vertex < this.size; vertex++) {
            if (!visited.has(vertex)) {
                if (dfsCheckCycle(vertex)) {
                    return true;
                }
            }
        }
        return false;
    }

    runWithTiming(algorithm) {
        const runs = 10; // Number of runs for averaging
        const times = [];
        let lastResult = null;

        // Warmup phase
        for (let i = 0; i < 3; i++) {
            algorithm.call(this);
        }

        // Actual timed runs
        for (let i = 0; i < runs; i++) {
            const start = performance.now();
            lastResult = algorithm.call(this);
            const end = performance.now();
            times.push(end - start);
        }

        // Calculate statistics
        times.sort((a, b) => a - b);
        const median = times[Math.floor(runs / 2)];
        const average = times.reduce((a, b) => a + b, 0) / runs;
        const min = times[0];
        const max = times[times.length - 1];

        return {
            result: lastResult.result,
            timing: {
                median,
                average,
                min,
                max
            },
            stats: lastResult.stats
        };
    }

    // DFS-based topological sort
    dfsTopologicalSort() {
        const visited = new Set();
        const stack = [];
        let comparisons = 0;
        let operations = 0;
        
        const dfs = (vertex) => {
            visited.add(vertex);
            operations++;
            
            // Stress test to make timing more noticeable
            for (let i = 0; i < 1000; i++) {
                Math.sqrt(i);
            }
            
            for (const neighbor of this.adjacencyList[vertex]) {
                comparisons++;
                if (!visited.has(neighbor)) {
                    dfs(neighbor);
                }
            }
            
            stack.unshift(vertex);
            operations++;
        };
        
        for (let vertex = 0; vertex < this.size; vertex++) {
            if (!visited.has(vertex)) {
                dfs(vertex);
            }
        }
        
        return {
            result: stack,
            stats: {
                comparisons,
                operations,
                vertices: this.size,
                edges: this.edgeCount
            }
        };
    }

    // Source removal algorithm
    sourceRemovalSort() {
        const result = [];
        const inDegree = new Array(this.size).fill(0);
        const queue = [];
        let comparisons = 0;
        let operations = 0;
        
        // Calculate in-degrees
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                comparisons++;
                if (this.matrix[i][j] === 1) {
                    inDegree[j]++;
                    operations++;
                }
            }
        }
        
        // Stress test to make timing more noticeable
        for (let i = 0; i < 1000; i++) {
            Math.sqrt(i);
        }
        
        // Find initial sources
        for (let i = 0; i < this.size; i++) {
            comparisons++;
            if (inDegree[i] === 0) {
                queue.push(i);
                operations++;
            }
        }
        
        while (queue.length > 0) {
            const vertex = queue.shift();
            result.push(vertex);
            operations += 2;
            
            for (const neighbor of this.adjacencyList[vertex]) {
                comparisons++;
                inDegree[neighbor]--;
                operations++;
                if (inDegree[neighbor] === 0) {
                    queue.push(neighbor);
                    operations++;
                }
            }
        }

        // Check if all vertices are included
        if (result.length !== this.size) {
            throw new Error("Not all vertices included in the sort. Graph may have a cycle.");
        }
        
        return {
            result,
            stats: {
                comparisons,
                operations,
                vertices: this.size,
                edges: this.edgeCount
            }
        };
    }

    // Find source using adjacency matrix - O(n²)
    findSourceMatrix() {
        const startTime = performance.now();
        let source = null;
        
        outer: for (let vertex = 0; vertex < this.size; vertex++) {
            for (let i = 0; i < this.size; i++) {
                if (this.matrix[i][vertex] === 1) {
                    continue outer;
                }
            }
            source = vertex;
            break;
        }
        
        const endTime = performance.now();
        return {
            result: source,
            time: endTime - startTime
        };
    }

    // Find source using adjacency list - O(V + E)
    findSourceList() {
        const startTime = performance.now();
        const hasIncomingEdge = new Array(this.size).fill(false);
        
        // Mark vertices that have incoming edges
        for (let vertex = 0; vertex < this.size; vertex++) {
            for (const neighbor of this.adjacencyList[vertex]) {
                hasIncomingEdge[neighbor] = true;
            }
        }
        
        // Find first vertex with no incoming edges
        let source = null;
        for (let vertex = 0; vertex < this.size; vertex++) {
            if (!hasIncomingEdge[vertex]) {
                source = vertex;
                break;
            }
        }
        
        const endTime = performance.now();
        return {
            result: source,
            time: endTime - startTime
        };
    }
}

// Process the input graph and display results
function processGraph() {
    try {
        // Get and validate number of vertices
        const vertices = parseInt(document.getElementById('vertices').value);
        if (isNaN(vertices) || vertices < 1) {
            throw new Error("Number of vertices must be a positive integer");
        }

        // Get and validate edge list
        const edgeListText = document.getElementById('edgeList').value.trim();
        if (!edgeListText) {
            throw new Error("Edge list cannot be empty");
        }

        // Parse edge list
        const edgeList = edgeListText
            .split('\n')
            .map(line => {
                const [from, to] = line.trim().split(',').map(num => {
                    const n = parseInt(num.trim());
                    if (isNaN(n)) {
                        throw new Error(`Invalid number in edge: ${line}`);
                    }
                    return n;
                });
                return [from, to];
            });

        // Create graph
        const graph = new Graph(vertices, edgeList);
        
        // Run DFS-based topological sort with timing
        const dfsResults = graph.runWithTiming(graph.dfsTopologicalSort);
        document.getElementById('dfsResult').textContent = 
            `Topological order: ${dfsResults.result.join(' → ')}`;
        document.getElementById('dfsTime').textContent = 
            `Execution time (ms) - Median: ${dfsResults.timing.median.toFixed(3)}, ` +
            `Average: ${dfsResults.timing.average.toFixed(3)}, ` +
            `Min: ${dfsResults.timing.min.toFixed(3)}, ` +
            `Max: ${dfsResults.timing.max.toFixed(3)}`;
        document.getElementById('dfsStats').textContent = 
            `Statistics: ${dfsResults.stats.vertices} vertices, ${dfsResults.stats.edges} edges, ` +
            `${dfsResults.stats.comparisons} comparisons, ${dfsResults.stats.operations} operations`;
        
        // Run source removal algorithm with timing
        const sourceResults = graph.runWithTiming(graph.sourceRemovalSort);
        document.getElementById('sourceRemovalResult').textContent = 
            `Topological order: ${sourceResults.result.join(' → ')}`;
        document.getElementById('sourceRemovalTime').textContent = 
            `Execution time (ms) - Median: ${sourceResults.timing.median.toFixed(3)}, ` +
            `Average: ${sourceResults.timing.average.toFixed(3)}, ` +
            `Min: ${sourceResults.timing.min.toFixed(3)}, ` +
            `Max: ${sourceResults.timing.max.toFixed(3)}`;
        document.getElementById('sourceRemovalStats').textContent = 
            `Statistics: ${sourceResults.stats.vertices} vertices, ${sourceResults.stats.edges} edges, ` +
            `${sourceResults.stats.comparisons} comparisons, ${sourceResults.stats.operations} operations`;
            
    } catch (error) {
        // Show detailed error message
        alert(`Error: ${error.message}\n\nPlease ensure:\n` +
              "1. Number of vertices is a positive integer\n" +
              "2. Each edge is in format 'from,to'\n" +
              "3. Vertex numbers are between 0 and (vertices-1)\n" +
              "4. Graph is acyclic (no cycles)\n" +
              "5. No self-loops (vertex to itself)");
    }
} 