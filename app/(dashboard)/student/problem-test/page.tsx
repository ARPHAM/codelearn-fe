'use client'

import ProblemUiStudent from '../components/problem-ui-student'


const exampleBlocks = [
    { 
        id: '1', 
        content: '<h3>Find Peak Element</h3><p>Một phần tử đỉnh là phần tử lớn hơn các phần tử kề cạnh. Cho mảng <code>nums</code>, tìm và trả về chỉ số của một phần tử đỉnh bất kỳ.</p>' 
    },
    { 
        id: '2', 
        content: '<p><strong>Ví dụ 1:</strong></p><div data-type="toggle"><p>Input: [1, 2, 3, 1]</p><p>Output: 2</p></div>' 
    }
]

export default function StudentProblemTestPage() {
    return (
        <>
            <ProblemUiStudent blocks={exampleBlocks} title="Luyện tập: Find Peak Element" />
        </>
    )
}
