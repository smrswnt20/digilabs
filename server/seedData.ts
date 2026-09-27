import { Practical, TestCase, User, Submission } from '../src/types';

export const SEED_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr-admin-1',
    name: 'System Administrator',
    fullName: 'System Administrator',
    email: 'admin@tcet.edu.in',
    passwordHash: 'admin123',
    role: 'ADMIN',
    department: 'Computer Engineering (Admin)',
    isActive: true,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z',
    lastLoginAt: '2026-09-24T09:30:00.000Z',
  },
  {
    id: 'usr-faculty-1',
    name: 'Dr. Priya Kulkarni',
    fullName: 'Dr. Priya Kulkarni',
    email: 'priya.kulkarni@tcet.edu.in',
    passwordHash: 'faculty123',
    role: 'FACULTY',
    department: 'Department of Computer Engineering',
    isActive: true,
    createdAt: '2026-08-01T08:30:00.000Z',
    updatedAt: '2026-08-01T08:30:00.000Z',
    lastLoginAt: '2026-09-24T09:45:00.000Z',
  },
  {
    id: 'usr-student-1',
    name: 'Aarav Mehta',
    fullName: 'Aarav Mehta',
    email: 'aarav.mehta@tcet.edu.in',
    passwordHash: 'student123',
    role: 'STUDENT',
    rollNumber: '42',
    batch: 'SE-A1',
    division: 'A',
    department: 'Computer Engineering',
    isActive: true,
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    lastLoginAt: '2026-09-24T10:00:00.000Z',
  },
  {
    id: 'usr-student-2',
    name: 'Isha Patil',
    fullName: 'Isha Patil',
    email: 'isha.patil@tcet.edu.in',
    passwordHash: 'student123',
    role: 'STUDENT',
    rollNumber: '43',
    batch: 'SE-A1',
    division: 'A',
    department: 'Computer Engineering',
    isActive: true,
    createdAt: '2026-08-10T10:05:00.000Z',
    updatedAt: '2026-08-10T10:05:00.000Z',
    lastLoginAt: '2026-09-23T14:15:00.000Z',
  },
  {
    id: 'usr-student-3',
    name: 'Rohan Deshmukh',
    fullName: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@tcet.edu.in',
    passwordHash: 'student123',
    role: 'STUDENT',
    rollNumber: '44',
    batch: 'SE-A2',
    division: 'A',
    department: 'Computer Engineering',
    isActive: true,
    createdAt: '2026-08-10T10:10:00.000Z',
    updatedAt: '2026-08-10T10:10:00.000Z',
    lastLoginAt: '2026-09-22T11:00:00.000Z',
  }
];

export const SEED_PRACTICALS: Practical[] = [
  {
    id: 1,
    title: 'Stack Using Array',
    problemStatement: `Develop a Java program to implement a stack data structure using a fixed-size array. The program should be menu-driven and support operations such as push, pop, peek/display and exit.\n\nStack is a LIFO (Last In First Out) data structure. Ensure overflow and underflow conditions are handled correctly.`,
    requirements: [
      'Implement stack using a fixed-size array (capacity: 100)',
      'Support Menu Operation 1: Push (reads element, pushes to stack)',
      'Support Menu Operation 2: Pop (removes top element and prints value or "Underflow" if empty)',
      'Support Menu Operation 3: Display (prints elements from top to bottom, separated by space)',
      'Support Menu Operation 4: Exit',
      'Follow the exact numerical menu input contract for automated evaluation'
    ],
    instructions: `Follow the standard input contract:
Menu commands:
1 <val> : Push <val>
2 : Pop top element
3 : Display stack contents from top to bottom
4 : Exit program

Print elements separated by space on display. For empty stack display or pop underflow, print "Empty" or "Underflow".`,
    inputContract: `Input format:
Sequence of integer commands terminated by 4.
Example:
1 10
1 20
3
4
Expected Output:
20 10`,
    starterCode: `import java.util.Scanner;

public class Main {
    static int[] stack = new int[100];
    static int top = -1;

    public static void push(int val) {
        if (top >= 99) {
            System.out.println("Overflow");
            return;
        }
        stack[++top] = val;
    }

    public static void pop() {
        if (top < 0) {
            System.out.println("Underflow");
            return;
        }
        System.out.println(stack[top--]);
    }

    public static void display() {
        if (top < 0) {
            System.out.println("Empty");
            return;
        }
        for (int i = top; i >= 0; i--) {
            System.out.print(stack[i] + (i == 0 ? "" : " "));
        }
        System.out.println();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (sc.hasNextInt()) {
            int choice = sc.nextInt();
            if (choice == 1) {
                int val = sc.nextInt();
                push(val);
            } else if (choice == 2) {
                pop();
            } else if (choice == 3) {
                display();
            } else if (choice == 4) {
                break;
            }
        }
        sc.close();
    }
}`,
    maxMarks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    allowResubmission: true,
    deadline: '2026-10-15T23:59:59.000Z',
    testCases: [
      {
        id: 'tc-1-1',
        practicalId: 1,
        input: '1 10\n1 20\n3\n4\n',
        expectedOutput: '20 10',
        marks: 2,
        isHidden: false,
        orderIndex: 1
      },
      {
        id: 'tc-1-2',
        practicalId: 1,
        input: '1 5\n1 15\n1 25\n2\n3\n4\n',
        expectedOutput: '25\n15 5',
        marks: 2,
        isHidden: false,
        orderIndex: 2
      },
      {
        id: 'tc-1-3',
        practicalId: 1,
        input: '2\n3\n4\n',
        expectedOutput: 'Underflow\nEmpty',
        marks: 2,
        isHidden: false,
        orderIndex: 3
      },
      {
        id: 'tc-1-4',
        practicalId: 1,
        input: '1 100\n1 200\n1 300\n2\n2\n3\n4\n',
        expectedOutput: '300\n200\n100',
        marks: 2,
        isHidden: true,
        orderIndex: 4
      },
      {
        id: 'tc-1-5',
        practicalId: 1,
        input: '1 42\n3\n2\n3\n4\n',
        expectedOutput: '42\n42\nEmpty',
        marks: 2,
        isHidden: true,
        orderIndex: 5
      }
    ]
  },
  {
    id: 2,
    title: 'Queue Using Array',
    problemStatement: `Develop a Java program to implement a linear queue using an array. The program should be menu-driven and support enqueue, dequeue, display and exit operations.\n\nQueue operates on FIFO (First In First Out) principle. Manage the front and rear pointers appropriately.`,
    requirements: [
      'Fixed-size array queue with front and rear indices',
      'Operation 1: Enqueue element',
      'Operation 2: Dequeue element and print dequeued value or "Underflow" if empty',
      'Operation 3: Display queue from front to rear',
      'Operation 4: Exit'
    ],
    instructions: `Standard menu:
1 <val> : Enqueue
2 : Dequeue
3 : Display from front to rear
4 : Exit`,
    inputContract: `Input:
1 10
1 20
1 30
3
4
Expected Output:
10 20 30`,
    starterCode: `import java.util.Scanner;

public class Main {
    static int[] q = new int[100];
    static int front = 0;
    static int rear = -1;

    public static void enqueue(int x) {
        if (rear >= 99) {
            System.out.println("Overflow");
            return;
        }
        q[++rear] = x;
    }

    public static void dequeue() {
        if (front > rear) {
            System.out.println("Underflow");
            return;
        }
        System.out.println(q[front++]);
    }

    public static void display() {
        if (front > rear) {
            System.out.println("Empty");
            return;
        }
        for (int i = front; i <= rear; i++) {
            System.out.print(q[i] + (i == rear ? "" : " "));
        }
        System.out.println();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (sc.hasNextInt()) {
            int ch = sc.nextInt();
            if (ch == 1) {
                enqueue(sc.nextInt());
            } else if (ch == 2) {
                dequeue();
            } else if (ch == 3) {
                display();
            } else if (ch == 4) {
                break;
            }
        }
        sc.close();
    }
}`,
    maxMarks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    allowResubmission: true,
    deadline: '2026-10-20T23:59:59.000Z',
    testCases: [
      {
        id: 'tc-2-1',
        practicalId: 2,
        input: '1 10\n1 20\n1 30\n3\n4\n',
        expectedOutput: '10 20 30',
        marks: 3,
        isHidden: false,
        orderIndex: 1
      },
      {
        id: 'tc-2-2',
        practicalId: 2,
        input: '1 100\n2\n2\n4\n',
        expectedOutput: '100\nUnderflow',
        marks: 3,
        isHidden: false,
        orderIndex: 2
      },
      {
        id: 'tc-2-3',
        practicalId: 2,
        input: '1 1\n1 2\n2\n1 3\n3\n4\n',
        expectedOutput: '1\n2 3',
        marks: 4,
        isHidden: true,
        orderIndex: 3
      }
    ]
  },
  {
    id: 3,
    title: 'Circular Queue',
    problemStatement: `Develop a Java program to implement a circular queue using an array. The program should be menu-driven and support insertion, deletion and display operations.\n\nCircular queue re-utilizes empty positions created by dequeues using modulo arithmetic: (rear + 1) % size.`,
    requirements: [
      'Implement circular queue of capacity 5',
      'Operation 1: Insert (Enqueue) <val>',
      'Operation 2: Delete (Dequeue)',
      'Operation 3: Display elements in circular sequence',
      'Operation 4: Exit'
    ],
    instructions: `Capacity is 5.
1 <val> : Enqueue
2 : Dequeue
3 : Display
4 : Exit`,
    inputContract: `1 10
1 20
1 30
3
4`,
    starterCode: `import java.util.Scanner;

public class Main {
    static final int SIZE = 5;
    static int[] cq = new int[SIZE];
    static int front = -1, rear = -1;

    public static void insert(int val) {
        if ((front == 0 && rear == SIZE - 1) || (rear + 1 == front)) {
            System.out.println("Overflow");
            return;
        }
        if (front == -1) {
            front = rear = 0;
        } else if (rear == SIZE - 1 && front != 0) {
            rear = 0;
        } else {
            rear++;
        }
        cq[rear] = val;
    }

    public static void delete() {
        if (front == -1) {
            System.out.println("Underflow");
            return;
        }
        int val = cq[front];
        if (front == rear) {
            front = rear = -1;
        } else if (front == SIZE - 1) {
            front = 0;
        } else {
            front++;
        }
        System.out.println(val);
    }

    public static void display() {
        if (front == -1) {
            System.out.println("Empty");
            return;
        }
        if (rear >= front) {
            for (int i = front; i <= rear; i++) {
                System.out.print(cq[i] + (i == rear ? "" : " "));
            }
        } else {
            for (int i = front; i < SIZE; i++) {
                System.out.print(cq[i] + " ");
            }
            for (int i = 0; i <= rear; i++) {
                System.out.print(cq[i] + (i == rear ? "" : " "));
            }
        }
        System.out.println();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (sc.hasNextInt()) {
            int ch = sc.nextInt();
            if (ch == 1) insert(sc.nextInt());
            else if (ch == 2) delete();
            else if (ch == 3) display();
            else if (ch == 4) break;
        }
        sc.close();
    }
}`,
    maxMarks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    allowResubmission: true,
    deadline: '2026-10-25T23:59:59.000Z',
    testCases: [
      {
        id: 'tc-3-1',
        practicalId: 3,
        input: '1 10\n1 20\n1 30\n3\n4\n',
        expectedOutput: '10 20 30',
        marks: 3,
        isHidden: false,
        orderIndex: 1
      },
      {
        id: 'tc-3-2',
        practicalId: 3,
        input: '1 1\n1 2\n1 3\n1 4\n1 5\n1 6\n4\n',
        expectedOutput: 'Overflow',
        marks: 3,
        isHidden: false,
        orderIndex: 2
      },
      {
        id: 'tc-3-3',
        practicalId: 3,
        input: '1 10\n1 20\n2\n1 30\n1 40\n1 50\n1 60\n3\n4\n',
        expectedOutput: '10\n20 30 40 50 60',
        marks: 4,
        isHidden: true,
        orderIndex: 3
      }
    ]
  },
  {
    id: 4,
    title: 'Singly Linked List',
    problemStatement: `Develop a Java program to implement a singly linked list. The program should be menu-driven and support insertion, deletion, searching and display operations.`,
    requirements: [
      'Node structure with integer data and next pointer',
      'Operation 1: Insert at end <val>',
      'Operation 2: Delete by value <val> (print "Deleted" or "Not Found")',
      'Operation 3: Search <val> (print "Found" or "Not Found")',
      'Operation 4: Display elements separated by space (or "Empty")',
      'Operation 5: Exit'
    ],
    instructions: `1 <val> : Insert at end
2 <val> : Delete value
3 <val> : Search value
4 : Display list
5 : Exit`,
    inputContract: `1 10
1 20
1 30
3 20
4
5`,
    starterCode: `import java.util.Scanner;

public class Main {
    static class Node {
        int data;
        Node next;
        Node(int d) { data = d; next = null; }
    }
    static Node head = null;

    public static void insert(int val) {
        Node n = new Node(val);
        if (head == null) {
            head = n;
            return;
        }
        Node t = head;
        while (t.next != null) t = t.next;
        t.next = n;
    }

    public static void delete(int val) {
        if (head == null) {
            System.out.println("Not Found");
            return;
        }
        if (head.data == val) {
            head = head.next;
            System.out.println("Deleted");
            return;
        }
        Node prev = head;
        while (prev.next != null && prev.next.data != val) {
            prev = prev.next;
        }
        if (prev.next == null) {
            System.out.println("Not Found");
        } else {
            prev.next = prev.next.next;
            System.out.println("Deleted");
        }
    }

    public static void search(int val) {
        Node t = head;
        while (t != null) {
            if (t.data == val) {
                System.out.println("Found");
                return;
            }
            t = t.next;
        }
        System.out.println("Not Found");
    }

    public static void display() {
        if (head == null) {
            System.out.println("Empty");
            return;
        }
        Node t = head;
        while (t != null) {
            System.out.print(t.data + (t.next == null ? "" : " "));
            t = t.next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (sc.hasNextInt()) {
            int ch = sc.nextInt();
            if (ch == 1) insert(sc.nextInt());
            else if (ch == 2) delete(sc.nextInt());
            else if (ch == 3) search(sc.nextInt());
            else if (ch == 4) display();
            else if (ch == 5) break;
        }
        sc.close();
    }
}`,
    maxMarks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    allowResubmission: true,
    deadline: '2026-10-30T23:59:59.000Z',
    testCases: [
      {
        id: 'tc-4-1',
        practicalId: 4,
        input: '1 10\n1 20\n1 30\n3 20\n4\n5\n',
        expectedOutput: 'Found\n10 20 30',
        marks: 3,
        isHidden: false,
        orderIndex: 1
      },
      {
        id: 'tc-4-2',
        practicalId: 4,
        input: '1 5\n1 15\n2 5\n4\n5\n',
        expectedOutput: 'Deleted\n15',
        marks: 3,
        isHidden: false,
        orderIndex: 2
      },
      {
        id: 'tc-4-3',
        practicalId: 4,
        input: '1 100\n2 999\n3 999\n4\n5\n',
        expectedOutput: 'Not Found\nNot Found\n100',
        marks: 4,
        isHidden: true,
        orderIndex: 3
      }
    ]
  },
  {
    id: 5,
    title: 'Doubly Linked List',
    problemStatement: `Develop a Java program to implement a doubly linked list. The program should be menu-driven and support insertion, deletion and display operations.`,
    requirements: [
      'Node with prev, data, next',
      'Operation 1: Insert at end <val>',
      'Operation 2: Delete by value <val> (prints "Deleted" or "Not Found")',
      'Operation 3: Display forward',
      'Operation 4: Exit'
    ],
    instructions: `1 <val> : Insert
2 <val> : Delete
3 : Display
4 : Exit`,
    inputContract: `1 10
1 20
3
4`,
    starterCode: `import java.util.Scanner;

public class Main {
    static class Node {
        int data;
        Node prev, next;
        Node(int d) { data = d; }
    }
    static Node head = null;

    public static void insert(int val) {
        Node n = new Node(val);
        if (head == null) {
            head = n;
            return;
        }
        Node t = head;
        while (t.next != null) t = t.next;
        t.next = n;
        n.prev = t;
    }

    public static void delete(int val) {
        if (head == null) {
            System.out.println("Not Found");
            return;
        }
        Node t = head;
        while (t != null && t.data != val) t = t.next;
        if (t == null) {
            System.out.println("Not Found");
            return;
        }
        if (t.prev != null) t.prev.next = t.next;
        else head = t.next;
        if (t.next != null) t.next.prev = t.prev;
        System.out.println("Deleted");
    }

    public static void display() {
        if (head == null) {
            System.out.println("Empty");
            return;
        }
        Node t = head;
        while (t != null) {
            System.out.print(t.data + (t.next == null ? "" : " "));
            t = t.next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (sc.hasNextInt()) {
            int ch = sc.nextInt();
            if (ch == 1) insert(sc.nextInt());
            else if (ch == 2) delete(sc.nextInt());
            else if (ch == 3) display();
            else if (ch == 4) break;
        }
        sc.close();
    }
}`,
    maxMarks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    allowResubmission: true,
    deadline: '2026-11-05T23:59:59.000Z',
    testCases: [
      {
        id: 'tc-5-1',
        practicalId: 5,
        input: '1 10\n1 20\n3\n4\n',
        expectedOutput: '10 20',
        marks: 3,
        isHidden: false,
        orderIndex: 1
      },
      {
        id: 'tc-5-2',
        practicalId: 5,
        input: '1 1\n1 2\n1 3\n2 2\n3\n4\n',
        expectedOutput: 'Deleted\n1 3',
        marks: 3,
        isHidden: false,
        orderIndex: 2
      },
      {
        id: 'tc-5-3',
        practicalId: 5,
        input: '1 100\n2 50\n4\n',
        expectedOutput: 'Not Found',
        marks: 4,
        isHidden: true,
        orderIndex: 3
      }
    ]
  },
  {
    id: 6,
    title: 'Binary Search Tree',
    problemStatement: `Develop a Java program to implement a Binary Search Tree (BST). The program should be menu-driven and support insertion, searching and traversal operations (Inorder traversal).`,
    requirements: [
      'BST node structure with left and right children',
      'Operation 1: Insert value <val>',
      'Operation 2: Search value <val> (print "Found" or "Not Found")',
      'Operation 3: Inorder traversal (prints sorted order)',
      'Operation 4: Exit'
    ],
    instructions: `1 <val> : Insert
2 <val> : Search
3 : Inorder Traversal
4 : Exit`,
    inputContract: `1 50
1 30
1 70
3
4
Output:
30 50 70`,
    starterCode: `import java.util.Scanner;

public class Main {
    static class Node {
        int data;
        Node left, right;
        Node(int d) { data = d; }
    }
    static Node root = null;

    static Node insertRec(Node r, int val) {
        if (r == null) return new Node(val);
        if (val < r.data) r.left = insertRec(r.left, val);
        else if (val > r.data) r.right = insertRec(r.right, val);
        return r;
    }

    static boolean searchRec(Node r, int val) {
        if (r == null) return false;
        if (r.data == val) return true;
        if (val < r.data) return searchRec(r.left, val);
        return searchRec(r.right, val);
    }

    static void inorderRec(Node r) {
        if (r != null) {
            inorderRec(r.left);
            System.out.print(r.data + " ");
            inorderRec(r.right);
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (sc.hasNextInt()) {
            int ch = sc.nextInt();
            if (ch == 1) {
                root = insertRec(root, sc.nextInt());
            } else if (ch == 2) {
                boolean f = searchRec(root, sc.nextInt());
                System.out.println(f ? "Found" : "Not Found");
            } else if (ch == 3) {
                if (root == null) System.out.println("Empty");
                else {
                    inorderRec(root);
                    System.out.println();
                }
            } else if (ch == 4) {
                break;
            }
        }
        sc.close();
    }
}`,
    maxMarks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    allowResubmission: true,
    deadline: '2026-11-10T23:59:59.000Z',
    testCases: [
      {
        id: 'tc-6-1',
        practicalId: 6,
        input: '1 50\n1 30\n1 70\n3\n4\n',
        expectedOutput: '30 50 70',
        marks: 3,
        isHidden: false,
        orderIndex: 1
      },
      {
        id: 'tc-6-2',
        practicalId: 6,
        input: '1 20\n1 10\n1 30\n2 10\n2 99\n4\n',
        expectedOutput: 'Found\nNot Found',
        marks: 3,
        isHidden: false,
        orderIndex: 2
      },
      {
        id: 'tc-6-3',
        practicalId: 6,
        input: '1 15\n1 10\n1 20\n1 8\n1 12\n3\n4\n',
        expectedOutput: '8 10 12 15 20',
        marks: 4,
        isHidden: true,
        orderIndex: 3
      }
    ]
  },
  {
    id: 7,
    title: 'AVL Tree',
    problemStatement: `Develop a Java program to implement an AVL tree. The program should be menu-driven and demonstrate insertion and the required rotations (LL, RR, LR, RL) while maintaining the AVL balance property.`,
    requirements: [
      'Self-balancing binary search tree with height factor calculation',
      'Implement Left and Right rotations',
      'Operation 1: Insert <val>',
      'Operation 2: Inorder traversal',
      'Operation 3: Exit'
    ],
    instructions: `1 <val> : Insert into AVL
2 : Inorder Traversal
3 : Exit`,
    inputContract: `1 10
1 20
1 30
2
3
Output:
10 20 30`,
    starterCode: `import java.util.Scanner;

public class Main {
    static class Node {
        int key, height;
        Node left, right;
        Node(int d) { key = d; height = 1; }
    }
    static Node root = null;

    static int height(Node n) { return n == null ? 0 : n.height; }
    static int getBalance(Node n) { return n == null ? 0 : height(n.left) - height(n.right); }

    static Node rightRotate(Node y) {
        Node x = y.left;
        Node T2 = x.right;
        x.right = y;
        y.left = T2;
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        return x;
    }

    static Node leftRotate(Node x) {
        Node y = x.right;
        Node T2 = y.left;
        y.left = x;
        x.right = T2;
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        return y;
    }

    static Node insert(Node node, int key) {
        if (node == null) return new Node(key);
        if (key < node.key) node.left = insert(node.left, key);
        else if (key > node.key) node.right = insert(node.right, key);
        else return node;

        node.height = 1 + Math.max(height(node.left), height(node.right));
        int balance = getBalance(node);

        if (balance > 1 && key < node.left.key) return rightRotate(node);
        if (balance < -1 && key > node.right.key) return leftRotate(node);
        if (balance > 1 && key > node.left.key) {
            node.left = leftRotate(node.left);
            return rightRotate(node);
        }
        if (balance < -1 && key < node.right.key) {
            node.right = rightRotate(node.right);
            return leftRotate(node);
        }
        return node;
    }

    static void inorder(Node r) {
        if (r != null) {
            inorder(r.left);
            System.out.print(r.key + " ");
            inorder(r.right);
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (sc.hasNextInt()) {
            int ch = sc.nextInt();
            if (ch == 1) root = insert(root, sc.nextInt());
            else if (ch == 2) {
                if (root == null) System.out.println("Empty");
                else {
                    inorder(root);
                    System.out.println();
                }
            } else if (ch == 3) break;
        }
        sc.close();
    }
}`,
    maxMarks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    allowResubmission: true,
    deadline: '2026-11-15T23:59:59.000Z',
    testCases: [
      {
        id: 'tc-7-1',
        practicalId: 7,
        input: '1 10\n1 20\n1 30\n2\n3\n',
        expectedOutput: '10 20 30',
        marks: 3,
        isHidden: false,
        orderIndex: 1
      },
      {
        id: 'tc-7-2',
        practicalId: 7,
        input: '1 30\n1 20\n1 10\n2\n3\n',
        expectedOutput: '10 20 30',
        marks: 3,
        isHidden: false,
        orderIndex: 2
      },
      {
        id: 'tc-7-3',
        practicalId: 7,
        input: '1 10\n1 30\n1 20\n2\n3\n',
        expectedOutput: '10 20 30',
        marks: 4,
        isHidden: true,
        orderIndex: 3
      }
    ]
  },
  {
    id: 8,
    title: 'Breadth First Search (BFS)',
    problemStatement: `Develop a Java program to implement Breadth First Search (BFS) for graph traversal. The program should take graph vertices, edges, and the starting node, and print the BFS traversal order.`,
    requirements: [
      'Graph representation using adjacency matrix or adjacency list',
      'Queue-based BFS traversal starting from specified start vertex',
      'Track visited vertices to prevent infinite cycles',
      'Output visited nodes separated by space'
    ],
    instructions: `Input Contract:
First line: V (number of vertices, 0 to V-1) and E (number of edges)
Next E lines: u v (edges)
Last line: startVertex
Output: BFS traversal order`,
    inputContract: `4 4
0 1
0 2
1 2
2 3
0
Output:
0 1 2 3`,
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int V = sc.nextInt();
        int E = sc.nextInt();

        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < V; i++) adj.add(new ArrayList<>());

        for (int i = 0; i < E; i++) {
            int u = sc.nextInt();
            int v = sc.nextInt();
            adj.get(u).add(v);
            adj.get(v).add(u);
        }

        int start = sc.nextInt();
        boolean[] visited = new boolean[V];
        Queue<Integer> q = new LinkedList<>();

        visited[start] = true;
        q.add(start);

        List<Integer> result = new ArrayList<>();
        while (!q.isEmpty()) {
            int curr = q.poll();
            result.add(curr);
            Collections.sort(adj.get(curr));
            for (int neighbor : adj.get(curr)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.add(neighbor);
                }
            }
        }

        for (int i = 0; i < result.size(); i++) {
            System.out.print(result.get(i) + (i == result.size() - 1 ? "" : " "));
        }
        System.out.println();
        sc.close();
    }
}`,
    maxMarks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    allowResubmission: true,
    deadline: '2026-11-20T23:59:59.000Z',
    testCases: [
      {
        id: 'tc-8-1',
        practicalId: 8,
        input: '4 4\n0 1\n0 2\n1 2\n2 3\n0\n',
        expectedOutput: '0 1 2 3',
        marks: 3,
        isHidden: false,
        orderIndex: 1
      },
      {
        id: 'tc-8-2',
        practicalId: 8,
        input: '5 4\n0 1\n0 2\n1 3\n1 4\n0\n',
        expectedOutput: '0 1 2 3 4',
        marks: 3,
        isHidden: false,
        orderIndex: 2
      },
      {
        id: 'tc-8-3',
        practicalId: 8,
        input: '3 3\n0 1\n1 2\n2 0\n1\n',
        expectedOutput: '1 0 2',
        marks: 4,
        isHidden: true,
        orderIndex: 3
      }
    ]
  },
  {
    id: 9,
    title: 'Depth First Search (DFS)',
    problemStatement: `Develop a Java program to implement Depth First Search (DFS) for graph traversal. The program should take graph vertices, edges, and the starting node, and print the DFS traversal order.`,
    requirements: [
      'Graph representation using adjacency list',
      'Recursive or stack-based DFS traversal',
      'Output DFS traversal path separated by space'
    ],
    instructions: `Input Contract:
First line: V (number of vertices) and E (number of edges)
Next E lines: u v (edges)
Last line: startVertex
Output: DFS traversal order`,
    inputContract: `4 4
0 1
0 2
1 2
2 3
0
Output:
0 1 2 3`,
    starterCode: `import java.util.*;

public class Main {
    static List<List<Integer>> adj;
    static boolean[] visited;
    static List<Integer> order;

    static void dfs(int u) {
        visited[u] = true;
        order.add(u);
        Collections.sort(adj.get(u));
        for (int v : adj.get(u)) {
            if (!visited[v]) {
                dfs(v);
            }
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int V = sc.nextInt();
        int E = sc.nextInt();

        adj = new ArrayList<>();
        for (int i = 0; i < V; i++) adj.add(new ArrayList<>());

        for (int i = 0; i < E; i++) {
            int u = sc.nextInt();
            int v = sc.nextInt();
            adj.get(u).add(v);
            adj.get(v).add(u);
        }

        int start = sc.nextInt();
        visited = new boolean[V];
        order = new ArrayList<>();

        dfs(start);

        for (int i = 0; i < order.size(); i++) {
            System.out.print(order.get(i) + (i == order.size() - 1 ? "" : " "));
        }
        System.out.println();
        sc.close();
    }
}`,
    maxMarks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    allowResubmission: true,
    deadline: '2026-11-25T23:59:59.000Z',
    testCases: [
      {
        id: 'tc-9-1',
        practicalId: 9,
        input: '4 4\n0 1\n0 2\n1 2\n2 3\n0\n',
        expectedOutput: '0 1 2 3',
        marks: 3,
        isHidden: false,
        orderIndex: 1
      },
      {
        id: 'tc-9-2',
        practicalId: 9,
        input: '5 4\n0 1\n0 2\n1 3\n1 4\n0\n',
        expectedOutput: '0 1 3 4 2',
        marks: 3,
        isHidden: false,
        orderIndex: 2
      },
      {
        id: 'tc-9-3',
        practicalId: 9,
        input: '3 2\n0 1\n1 2\n2\n',
        expectedOutput: '2 1 0',
        marks: 4,
        isHidden: true,
        orderIndex: 3
      }
    ]
  },
  {
    id: 10,
    title: 'Java Basics: Data Types, Operators & Control Statements',
    problemStatement: `Develop a comprehensive Java program demonstrating core language fundamentals across two sections:\n\nSection A: Data Types and Operators (demonstrate arithmetic, relational, and bitwise evaluation).\nSection B: Control Statements (demonstrate conditional branching and loop iteration).`,
    requirements: [
      'Section A: Read operation type 1: perform arithmetic and bitwise operation on two integers',
      'Section B: Read operation type 2: evaluate conditional status (Positive/Negative/Zero) and generate sequence loop up to N',
      'Exit on choice 3'
    ],
    instructions: `Menu:
1 <a> <b> : Compute (a+b), (a*b), (a&b) printed on one line separated by space
2 <num> : Check conditional (prints "Positive", "Negative", or "Zero") and print 1 to num (if positive)
3 : Exit`,
    inputContract: `1 5 3
2 4
3
Output:
8 15 1
Positive 1 2 3 4`,
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (sc.hasNextInt()) {
            int ch = sc.nextInt();
            if (ch == 1) {
                int a = sc.nextInt();
                int b = sc.nextInt();
                int sum = a + b;
                int prod = a * b;
                int bitAnd = a & b;
                System.out.println(sum + " " + prod + " " + bitAnd);
            } else if (ch == 2) {
                int n = sc.nextInt();
                if (n > 0) {
                    System.out.print("Positive ");
                    for (int i = 1; i <= n; i++) {
                        System.out.print(i + (i == n ? "" : " "));
                    }
                    System.out.println();
                } else if (n < 0) {
                    System.out.println("Negative");
                } else {
                    System.out.println("Zero");
                }
            } else if (ch == 3) {
                break;
            }
        }
        sc.close();
    }
}`,
    maxMarks: 10,
    timeLimitSeconds: 3,
    memoryLimitMb: 256,
    allowResubmission: true,
    deadline: '2026-11-30T23:59:59.000Z',
    testCases: [
      {
        id: 'tc-10-1',
        practicalId: 10,
        input: '1 5 3\n3\n',
        expectedOutput: '8 15 1',
        marks: 3,
        isHidden: false,
        orderIndex: 1
      },
      {
        id: 'tc-10-2',
        practicalId: 10,
        input: '2 4\n3\n',
        expectedOutput: 'Positive 1 2 3 4',
        marks: 3,
        isHidden: false,
        orderIndex: 2
      },
      {
        id: 'tc-10-3',
        practicalId: 10,
        input: '2 -5\n2 0\n3\n',
        expectedOutput: 'Negative\nZero',
        marks: 4,
        isHidden: true,
        orderIndex: 3
      }
    ]
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-demo-1',
    studentId: 'usr-student-2',
    studentName: 'Isha Patil',
    rollNumber: '43',
    batch: 'SE-A1',
    division: 'A',
    practicalId: 1,
    practicalTitle: 'Stack Using Array',
    sourceCode: SEED_PRACTICALS[0].starterCode,
    status: 'EVALUATED',
    passedTests: 5,
    totalTests: 5,
    autoScore: 10,
    facultyScore: 10,
    finalScore: 10,
    facultyRemarks: 'Excellent modular structure and clean handling of stack boundaries.',
    testResults: [
      { testCaseId: 'tc-1-1', orderIndex: 1, isHidden: false, passed: true, marksAwarded: 2, maxMarks: 2, executionTimeMs: 140 },
      { testCaseId: 'tc-1-2', orderIndex: 2, isHidden: false, passed: true, marksAwarded: 2, maxMarks: 2, executionTimeMs: 130 },
      { testCaseId: 'tc-1-3', orderIndex: 3, isHidden: false, passed: true, marksAwarded: 2, maxMarks: 2, executionTimeMs: 125 },
      { testCaseId: 'tc-1-4', orderIndex: 4, isHidden: true, passed: true, marksAwarded: 2, maxMarks: 2, executionTimeMs: 135 },
      { testCaseId: 'tc-1-5', orderIndex: 5, isHidden: true, passed: true, marksAwarded: 2, maxMarks: 2, executionTimeMs: 120 },
    ],
    submittedAt: '2026-09-08T10:30:00.000Z',
    evaluatedAt: '2026-09-09T14:15:00.000Z'
  },
  {
    id: 'sub-demo-2',
    studentId: 'usr-student-3',
    studentName: 'Rohan Deshmukh',
    rollNumber: '44',
    batch: 'SE-A2',
    division: 'A',
    practicalId: 1,
    practicalTitle: 'Stack Using Array',
    sourceCode: SEED_PRACTICALS[0].starterCode,
    status: 'SUBMITTED',
    passedTests: 4,
    totalTests: 5,
    autoScore: 8,
    facultyScore: null,
    finalScore: null,
    facultyRemarks: null,
    testResults: [
      { testCaseId: 'tc-1-1', orderIndex: 1, isHidden: false, passed: true, marksAwarded: 2, maxMarks: 2, executionTimeMs: 145 },
      { testCaseId: 'tc-1-2', orderIndex: 2, isHidden: false, passed: true, marksAwarded: 2, maxMarks: 2, executionTimeMs: 140 },
      { testCaseId: 'tc-1-3', orderIndex: 3, isHidden: false, passed: true, marksAwarded: 2, maxMarks: 2, executionTimeMs: 135 },
      { testCaseId: 'tc-1-4', orderIndex: 4, isHidden: true, passed: true, marksAwarded: 2, maxMarks: 2, executionTimeMs: 130 },
      { testCaseId: 'tc-1-5', orderIndex: 5, isHidden: true, passed: false, marksAwarded: 0, maxMarks: 2, executionTimeMs: 150, error: 'Wrong Answer on boundary condition' },
    ],
    submittedAt: '2026-09-09T16:45:00.000Z',
    evaluatedAt: null
  },
  {
    id: 'sub-demo-3',
    studentId: 'usr-student-1',
    studentName: 'Aarav Mehta',
    rollNumber: '42',
    batch: 'SE-A1',
    division: 'A',
    practicalId: 2,
    practicalTitle: 'Queue Using Array',
    sourceCode: SEED_PRACTICALS[1].starterCode,
    status: 'EVALUATED',
    passedTests: 3,
    totalTests: 3,
    autoScore: 10,
    facultyScore: 9,
    finalScore: 9,
    facultyRemarks: 'Good implementation. Remember to document time complexities in comments.',
    testResults: [
      { testCaseId: 'tc-2-1', orderIndex: 1, isHidden: false, passed: true, marksAwarded: 3, maxMarks: 3, executionTimeMs: 140 },
      { testCaseId: 'tc-2-2', orderIndex: 2, isHidden: false, passed: true, marksAwarded: 3, maxMarks: 3, executionTimeMs: 135 },
      { testCaseId: 'tc-2-3', orderIndex: 3, isHidden: true, passed: true, marksAwarded: 4, maxMarks: 4, executionTimeMs: 150 }
    ],
    submittedAt: '2026-09-07T11:20:00.000Z',
    evaluatedAt: '2026-09-08T15:00:00.000Z'
  }
];
